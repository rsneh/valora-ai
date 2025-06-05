import brevo_python
from app.core.config import settings
from jinja2 import Environment, FileSystemLoader
from brevo_python.rest import ApiException

BREVO_API_KEY = settings.BREVO_API_KEY
TEMPLATES_DIR = "app/core/email_templates"

jinja_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))


class BrevoEmailSender:
    """
    A class to send emails using the Brevo (formerly Sendinblue) API.
    """

    def __init__(self, api_key: str = BREVO_API_KEY):
        """
        Initializes the BrevoEmailSender.

        Args:
            api_key (str): Your Brevo API key.
        """
        if not api_key:
            raise ValueError("API key cannot be empty.")
        self.configuration = brevo_python.Configuration()
        self.configuration.api_key["api-key"] = api_key
        self.instance = brevo_python.TransactionalEmailsApi(
            brevo_python.ApiClient(self.configuration)
        )

    def send_email(
        self,
        sender_email: str,
        sender_name: str,
        to_email: str,
        to_name: str = None,
        subject: str = "",
        html_content: str = "",
        text_content: str = None,
        cc_emails: list = None,
        bcc_emails: list = None,
        reply_to_email: str = None,
        reply_to_name: str = None,
    ) -> dict:
        """
        Sends an email using the Brevo API.

        Args:
            sender_email (str): The email address of the sender.
            sender_name (str): The name of the sender.
            to_email (str): The email address of the primary recipient.
            to_name (str, optional): The name of the primary recipient. Defaults to None.
            subject (str, optional): The subject of the email. Defaults to "".
            html_content (str, optional): The HTML content of the email. Defaults to "".
            text_content (str, optional): The plain text content of the email.
                                         If html_content is provided, this is often optional.
                                         Defaults to None.
            cc_emails (list, optional): A list of email addresses for CC recipients.
                                        Each item can be a string (email) or a dict {"email": "cc@example.com", "name": "CC Name"}.
                                        Defaults to None.
            bcc_emails (list, optional): A list of email addresses for BCC recipients.
                                         Each item can be a string (email) or a dict {"email": "bcc@example.com", "name": "BCC Name"}.
                                         Defaults to None.
            reply_to_email (str, optional): The email address for replies. Defaults to None.
            reply_to_name (str, optional): The name for replies. Defaults to None.
            tags (list, optional): A list of tags to associate with the email. Defaults to None.


        Returns:
            dict: A dictionary containing the API response (JSON) or an error message.
        """

        if not sender_email or not to_email:
            raise ValueError("Sender email and recipient email cannot be empty.")

        payload = {
            "sender": {"email": sender_email, "name": sender_name},
            "to": [{"email": to_email, "name": to_name if to_name else to_email}],
            "subject": subject,
            "html_content": html_content,
        }

        if text_content:
            payload["text_content"] = text_content

        if cc_emails:
            payload["cc"] = []
            for cc in cc_emails:
                if isinstance(cc, str):
                    payload["cc"].append({"email": cc, "name": cc})
                elif isinstance(cc, dict) and "email" in cc:
                    payload["cc"].append(cc)

        if bcc_emails:
            payload["bcc"] = []
            for bcc in bcc_emails:
                if isinstance(bcc, str):
                    payload["bcc"].append({"email": bcc, "name": bcc})
                elif isinstance(bcc, dict) and "email" in bcc:
                    payload["bcc"].append(bcc)

        if reply_to_email:
            payload["reply_to"] = {"email": reply_to_email}
            if reply_to_name:
                payload["reply_to"]["name"] = reply_to_name

        # Ensure htmlContent or textContent is present
        if not html_content and not text_content:
            raise ValueError("Either html_content or text_content must be provided.")

        try:

            send_smtp_email = brevo_python.SendSmtpEmail(**payload)
            api_response = self.instance.send_transac_email(send_smtp_email)
            return api_response
        except ApiException as e:
            print(
                "Exception when calling TransactionalEmailsApi->send_transac_email: %s\n"
                % e
            )


def send_email_template(
    template_name: str,
    subject: str,
    to_email: str,
    to_name: str = None,
    context: dict = {},
):
    sender = BrevoEmailSender()

    context.setdefault("base_url", settings.FRONTEND_BASE_URL)

    try:
        template = jinja_env.get_template(template_name)
        html_content = template.render(context)

        response = sender.send_email(
            sender_email="assistant@valoraai.net",
            sender_name="Valora AI Assistant",
            to_email=to_email,
            to_name=to_name,
            subject=subject,
            html_content=html_content,
        )
        print(f"Email Response: {response}\n")
    except ValueError as ve:
        print(f"Caught ValueError: {ve}\n")
