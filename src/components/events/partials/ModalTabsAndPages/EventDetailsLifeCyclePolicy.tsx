import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getLifeCyclePoliciesForEvent } from "../../../../selectors/eventDetailsSelectors";
import { fetchEventLifeCyclePolicies } from "../../../../slices/eventDetailsSlice";
import ModalContentTable from "../../../shared/modals/ModalContentTable";
import Notifications from "../../../shared/Notifications";
import ButtonLikeAnchor from "../../../shared/ButtonLikeAnchor";
import { LuChevronRight } from "react-icons/lu";
import { useNavigate } from "react-router";
import { fetchLifeCyclePolicyDetails, openModal } from "../../../../slices/lifeCycleDetailsSlice";
import { LifeCyclePolicy } from "../../../../slices/lifeCycleSlice";


/**
 * This component shows lifecycle policies that would affect the event
 */
const EventDetailsLifeCyclePolicy = ({
  eventId,
}: {
  eventId: string,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const policies = useAppSelector(state => getLifeCyclePoliciesForEvent(state));

  useEffect(() => {
    dispatch(fetchEventLifeCyclePolicies(eventId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPolicyDetails = async (policy: LifeCyclePolicy) => {
    await dispatch(fetchLifeCyclePolicyDetails(policy.id));
    dispatch(openModal(policy));
    navigate("/events/lifeCyclePolicies");
  };

  return (
    <ModalContentTable
      modalBodyChildren={<Notifications context="not_corner" />}
    >
      {/* Disclaimer */}
      <div className="obj list-obj">
        <header className="no-expand">
          {t("EVENTS.EVENTS.DETAILS.LIFECYCLEPOLICIES.DISCLAIMER.TITLE")}
        </header>
        <div className="obj-container">
          <span>{t("EVENTS.EVENTS.DETAILS.LIFECYCLEPOLICIES.DISCLAIMER.MESSAGE")}</span>
        </div>
      </div>

      <div className="obj tbl-container">
        {
          /* No policies message */
          policies.length === 0 && (
            <table className="main-tbl">
              <tr>
                <td colSpan={4}>
                  {t("EVENTS.EVENTS.DETAILS.LIFECYCLEPOLICIES.EMPTY")}
                </td>
              </tr>
            </table>
          )
        }

        { policies.length !== 0 && (
          <div className="obj-container">
            <table className="main-tbl">
                <>
                  <thead>
                    <tr>
                      <th>
                        {t("EVENTS.EVENTS.DETAILS.LIFECYCLEPOLICIES.TABLE_TITLE")}
                      </th>
                      <th className="medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {
                      policies.map((policy, key) => (
                        <tr key={key}>
                          <td>
                            {policy.title}
                          </td>

                          {/* link to 'Details' sub-Tab */}
                          <td>
                            <ButtonLikeAnchor
                              className="details-link"
                              onClick={() => { openPolicyDetails(policy); }}
                            >
                              {t("EVENTS.EVENTS.DETAILS.MEDIA.DETAILS")}
                              <LuChevronRight className="details-link-icon"/>
                            </ButtonLikeAnchor>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </>
            </table>
          </div>
        )}
      </div>
    </ModalContentTable>
  );
};

export default EventDetailsLifeCyclePolicy;
