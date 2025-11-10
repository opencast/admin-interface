Opencast Admin UI
=================

The Opencast Admin UI is a graphical interface included with Opencast
that allows admins to easily manage their Opencast instance.

Development and testing
-----------------------

To get a local copy of the admin UI to test or develop on, you can do the following:

```sh
git clone git@github.com:opencast/opencast-admin-interface.git opencast-admin-interface-demo
cd opencast-admin-interface-demo
git switch my-branch  # or otherwise check out, pull, merge, etc. whatever branch you want to test/hack on
npm ci
```

You can now run a local instance of the UI by saying

```sh
npm start
```

This runs a development server at `http://localhost:3000`, serving a development build
of the admin UI, and automatically opens a browser tab pointed to it.
The build and the browser tab should automatically refresh on every change you make
to the codebase.

The default target for API calls is `https://develop.opencast.org` to which the development server will proxy all the backend request,
authenticating them as user `admin` with password `opencast`.

If you want to work with a different Opencast and/or user, you can change the command thusly:

```sh
PROXY_TARGET=http://localhost:8080 npm start
```

Here, `PROXY_TARGET` is the target URL of the Opencast instance you want to test against.

By default, this tries to authenticate backend requests using HTTP Basic Auth
as user `admin` with the default password `opencast`.
If you want to authenticate using different credentials, you can specify them
in the `PROXY_AUTH` variable in the format `user:password`, as in

```sh
PROXY_TARGET=http://localhost:8080 PROXY_AUTH=jdoe:aligator3 npm start
```

Similarly, if you want to change the port the development server itself runs at,
you can specify an alternative port in the `PORT` environment variable.

If you aim to test against a remote server without using a proxy, you have the option to configure the target server with the `VITE_TEST_SERVER_URL`, and the `VITE_TEST_SERVER_AUTH` environment variables while using the node development mode:

```sh
NODE_ENV=development VITE_TEST_SERVER_URL="https://develop.opencast.org" VITE_TEST_SERVER_AUTH="admin:opencast" npm start
```


How to cut a release for Opencast via the Github UI
---------------------------------------------------

1. (Optional) Run the GitHub Actions workflow [Crowdin » Download translations
   ](https://github.com/opencast/opencast-admin-interface/actions/workflows/crowdin-download-translations.yml)
   to ensure all changes from Crowdin are included in the new release.

2. Use the [Release » Create release tag](https://github.com/opencast/opencast-admin-interface/actions/workflows/release-cut-tag.yml)
   workflow to create a correctly named tag in the appropriate branch.  When running the workflow via the dropdown
   ensure you select the correct branch for the release!

3. Wait for the [Release » Process release tag](https://github.com/opencast/opencast-admin-interface/actions/workflows/release-build.yml)
   workflow to finish
    - It will create a new [GitHub release](https://github.com/opencast/opencast-admin-interface/releases)
      - Review the release and make sure the notes are right, update them if not.
        - By selecting the previous release, Github can generate release notes automatically
      - This review isn't required to happen prior to the next step!

5. Merge the upstream issue that the workflow above filed in [Opencast's main repository](https://github.com/opencast/opencast)


How to cut a release for Opencast manually with git
---------------------------------------------------

1. (Optional) Run the GitHub Actions workflow [Crowdin » Download translations
   ](https://github.com/opencast/opencast-admin-interface/actions/workflows/crowdin-download-translations.yml)
   to ensure all changes from Crowdin are included in the new release.

2. Switch to the commit you want to turn into the release - make sure this is the on `develop` or an `r/N.x` branch

3. Create and push a new tag
   ```bash
    BRANCH=N.x (make sure the version you write here matches the branch you have checked out)
    DATE=$(date +%Y-%m-%d)
    git tag -sm "Release $BRANCH-$DATE" -s "$BRANCH-$DATE"
    git push upstream "$BRANCH-$DATE":"$BRANCH-$DATE"
   ```

4. Wait for the [Release » Process release tag](https://github.com/opencast/opencast-admin-interface/actions/workflows/release-build.yml)
   workflow to finish
    - It will create a new [GitHub release](https://github.com/opencast/opencast-admin-interface/releases)
      - Review the release and make sure the notes are right, update them if not.
        - By selecting the previous release, Github can generate release notes automatically
      - This review isn't required to happen prior to the next step!

5. Merge the upstream issue that the workflow above filed in [Opencast's main repository](https://github.com/opencast/opencast)


Translating the Admin Interface
-------------------------------

You can help translate the Opencast Admin UI to your language on [crowdin.com/project/opencast-admin-interface](https://crowdin.com/project/opencast-admin-interface). Simply request to join the project on Crowdin and start translating. If you are interested in translating a language that is not a target language right now, please create [a GitHub issue](https://github.com/opencast/opencast-admin-interface/issues) and we will add the language.

This project follows the general form of [Opencast's Localization Process](https://docs.opencast.org/develop/developer/#participate/localization/), especially regarding what happens when you need to [change an existing translation key](https://docs.opencast.org/develop/developer/#participate/localization/#i-need-to-update-the-wording-of-the-source-translation-what-happens).  Any questions not answered there should be referred to the mailing lists!


Configuration
-------------

The Admin UI frontend cannot be directly configured. Rather, it adapts to the
various configurations in the Opencast backend. Fore more information, take a look
at [Opencast's documentation](https://docs.opencast.org).
