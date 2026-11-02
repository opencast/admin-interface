import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Select, {
	components as SelectComponents,
	GroupBase,
	MenuListProps,
	OptionProps,
	ValueContainerProps,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import { dropDownSpacingTheme, dropDownStyle } from "../../utils/componentStyles";
import { DropDownOption } from "./DropDown";

// How long to wait after the user stops typing before searching.
const SEARCH_DEBOUNCE_MS = 300;

// A page may consist only of options that the caller filters out. Look at this many pages in a row for something to
// show before giving up, so that a menu that could be scrolled is not left empty.
const MAX_CONSECUTIVE_EMPTY_PAGES = 10;

export type DropDownPage = {
	options: DropDownOption<string>[]
	// Offset to pass to fetch the page after this one, undefined if this was the last page.
	nextOffset: number | undefined
}

// How close to the end of the list, in pixels, counts as having reached it
const NEAR_BOTTOM_PX = 10;

/**
 * The list of options. Tells when its end is in view, and shows that there is more to come while it is loading.
 *
 * react-select's own onMenuScrollToBottom only reacts to the mouse wheel and touch, not to the keyboard or to
 * dragging the scrollbar, so look at the scroll position instead.
 */
const PagedMenuList = (
	props: MenuListProps<DropDownOption<string>, boolean, GroupBase<DropDownOption<string>>>,
) => {
	const { t } = useTranslation();
	// onNearBottom is passed to the select by us, and react-select hands all props on to its components
	const { onNearBottom, isLoading } = props.selectProps as typeof props.selectProps & { onNearBottom?: () => void };
	const { innerRef } = props;
	const element = useRef<HTMLDivElement | null>(null);

	// react-select needs the list element too, so pass it on
	const setRefs = useCallback((node: HTMLDivElement | null) => {
		element.current = node;
		if (typeof innerRef === "function") {
			innerRef(node);
		} else if (innerRef) {
			innerRef.current = node;
		}
	}, [innerRef]);

	const checkIfNearBottom = (list: HTMLDivElement | null) => {
		if (list && list.scrollHeight - list.clientHeight - list.scrollTop <= NEAR_BOTTOM_PX) {
			onNearBottom?.();
		}
	};

	// A list that is not long enough to scroll never gets scrolled, so look again whenever it changes
	useEffect(() => {
		checkIfNearBottom(element.current);
	});

	return (
		<SelectComponents.MenuList
			{...props}
			innerRef={setRefs}
			innerProps={{ ...props.innerProps, onScroll: event => checkIfNearBottom(event.currentTarget) }}
		>
			{props.children}
			{isLoading && props.options.length > 0 &&
				<div style={{ padding: "2px 8px", textAlign: "left" }}>
					{t("SELECT_LOADING")}
				</div>
			}
		</SelectComponents.MenuList>
	);
};

/**
 * The page of options that is being asked for. Everything that is loaded follows from this.
 */
type Request = {
	query: string
	offset: number
}

/**
 * What was loaded in answer to a request. The options are those of all pages loaded so far for the query.
 */
type Loaded = Request & {
	options: DropDownOption<string>[]
	nextOffset: number | undefined
}

/**
 * A dropdown that loads its options from the server, a page at a time, as the user scrolls down the list or
 * searches. The order of the options is the order in which the server returned them.
 *
 * Intended for lists that are too long to fetch at once. Other dropdowns should use DropDown.
 */
const PagedDropDown = ({
	value,
	text,
	fetchPage,
	handleChange,
	placeholder,
	tabIndex = 0,
	creatable = false,
	disabled = false,
	customCSS,
}: {
	value: string
	text: string
	// Fetches the page of options that starts at the given offset, for the given search text.
	fetchPage: (inputValue: string, offset: number) => Promise<DropDownPage>
	handleChange: (option: {value: string, label: string} | null) => void
	placeholder: string
	tabIndex?: number
	creatable?: boolean
	disabled?: boolean
	customCSS?: Parameters<typeof dropDownStyle>[0]
}) => {
	const { t } = useTranslation();

	// Always call the latest fetchPage, without having to start over whenever the caller passes a new function
	const fetchPageRef = useRef(fetchPage);
	useEffect(() => {
		fetchPageRef.current = fetchPage;
	}, [fetchPage]);

	const [menuIsOpen, setMenuIsOpen] = useState(false);
	// What the user typed, and what is currently being asked for (which follows the input after a pause)
	const [inputValue, setInputValue] = useState("");
	const [request, setRequest] = useState<Request>({ query: "", offset: 0 });
	const [loaded, setLoaded] = useState<Loaded | undefined>(undefined);

	const isLoading = menuIsOpen
		&& (loaded === undefined || loaded.query !== request.query || loaded.offset !== request.offset);

	// Search for what was typed, once the user pauses
	useEffect(() => {
		if (!menuIsOpen) {
			return;
		}
		const timeout = setTimeout(() => {
			setRequest(current => current.query === inputValue ? current : { query: inputValue, offset: 0 });
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [inputValue, menuIsOpen]);

	// Load what was asked for. If the request changes before the answer arrives, the answer is not wanted any more.
	useEffect(() => {
		if (!menuIsOpen) {
			return;
		}

		let isOutdated = false;
		const load = async () => {
			let options: DropDownOption<string>[] = [];
			let nextOffset: number | undefined = request.offset;
			try {
				for (let i = 0; i < MAX_CONSECUTIVE_EMPTY_PAGES && nextOffset !== undefined; i++) {
					const page = await fetchPageRef.current(request.query, nextOffset);
					options = options.concat(page.options);
					nextOffset = page.nextOffset;
					if (isOutdated || options.length > 0) {
						break;
					}
				}
			} catch {
				// Show what there is, and do not try again
				nextOffset = undefined;
			}
			if (isOutdated) {
				return;
			}

			setLoaded(previous => {
				if (previous === undefined || previous.query !== request.query || request.offset === 0) {
					return { ...request, options, nextOffset };
				}
				const known = new Set(previous.options.map(option => option.value));
				return {
					...request,
					options: previous.options.concat(options.filter(option => !known.has(option.value))),
					nextOffset,
				};
			});
		};
		void load();

		return () => {
			isOutdated = true;
		};
	}, [menuIsOpen, request]);

	const onMenuOpen = () => {
		// Fetch lazily: there can be a lot of these dropdowns on one page, so do not fetch before one is opened.
		setLoaded(undefined);
		setRequest({ query: "", offset: 0 });
		setMenuIsOpen(true);
	};

	const onInputChange = (newValue: string, meta: { action: string }) => {
		// The input is reset when the menu closes, or an option is chosen
		setInputValue(meta.action === "input-change" ? newValue : "");
	};

	const onNearBottom = () => {
		if (!isLoading && loaded?.nextOffset !== undefined) {
			setRequest({ query: loaded.query, offset: loaded.nextOffset });
		}
	};

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		// Moving down from the last option wraps around to the first one. Do not do that while the list is still
		// being filled, so that the user ends up at the new options instead.
		if (event.key === "ArrowDown" && isLoading) {
			event.preventDefault();
		}
	};

	/**
	 * Wrapper that adds the title attribute to options, which should result
	 * in a native tooltip that is intended to help with very long labels.
	 */
	const OptionWithTitle = useCallback((
		props: OptionProps<DropDownOption<string>, boolean, GroupBase<DropDownOption<string>>>,
	) => (
		<SelectComponents.Option {...props} innerProps={{ ...props.innerProps, title: props.data.label }} />
	), []);

	/**
	 * Same wrapper as above, but for the input field.
	 */
	const ValueContainerWithTitle = useCallback((
		props: ValueContainerProps<DropDownOption<string>, boolean, GroupBase<DropDownOption<string>>>,
	) => (
		<SelectComponents.ValueContainer
			{...props}
			innerProps={{ ...props.innerProps, title: props.getValue()[0]?.label }}
		/>
	), []);

	const commonProps = {
		tabIndex: tabIndex,
		theme: dropDownSpacingTheme,
		styles: dropDownStyle<string>(customCSS ?? {}),
		isSearchable: true,
		value: { value: value, label: text === "" ? placeholder : text },
		options: loaded?.options ?? [],
		// The server does the searching
		filterOption: null,
		inputValue: inputValue,
		onInputChange: onInputChange,
		isLoading: isLoading,
		placeholder: placeholder,
		onChange: (element: unknown) => handleChange(element as { value: string, label: string } | null),
		menuIsOpen: menuIsOpen,
		onMenuOpen: onMenuOpen,
		onMenuClose: () => setMenuIsOpen(false),
		onNearBottom: onNearBottom,
		onKeyDown: onKeyDown,
		isDisabled: disabled,
		menuPlacement: "auto" as const,
		components: {
			MenuList: PagedMenuList,
			Option: OptionWithTitle,
			ValueContainer: ValueContainerWithTitle,
		},
		noOptionsMessage: () => t("SELECT_NO_MATCHING_RESULTS"),
		loadingMessage: () => t("SELECT_LOADING"),
	};

	return creatable ? (
		<CreatableSelect {...commonProps} />
	) : (
		<Select {...commonProps} />
	);
};

export default PagedDropDown;
