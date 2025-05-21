from typing import Optional
from fastapi import Header, Request

AppLocale = str  # Define your AppLocale type as needed
supported_locales = ["en", "he"]
default_locale = "en"
locale_cookie_name = "VALORA_LOCALE"


async def get_locale_from_header(
    request: Request,  # Access the full request
    # accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    x_app_locale: Optional[str] = Header(None, alias="X-App-Locale"),
) -> AppLocale:
    if x_app_locale and x_app_locale in supported_locales:
        return x_app_locale

    # if accept_language:
    #     # Example: "es-ES,es;q=0.9,en;q=0.8,de;q=0.7,*"
    #     # You'd need more robust parsing for complex Accept-Language strings
    #     # For simplicity, we take the first part if it's a supported locale
    #     langs = accept_language.split(",")
    #     for lang_entry in langs:
    #         locale_code = lang_entry.split(";")[0].strip().lower()
    #         # Check for full locale (e.g., en-us) or just language part (e.g., en)
    #         if locale_code in supported_locales:
    #             return locale_code
    #         if len(locale_code) > 2 and locale_code[:2] in supported_locales:
    #             return locale_code[:2]  # type: ignore (cast to AppLocale if needed)

    locale_from_cookie = request.cookies.get(locale_cookie_name)
    if locale_from_cookie and locale_from_cookie in supported_locales:
        return locale_from_cookie

    return default_locale
