import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { getCategories } from "@/services/api/categories"
import { getLocaleFromRequest } from "@/lib/dictionaries"

interface PolicySectionProps extends React.PropsWithChildren {
  title: string;
  level?: 1 | 2 | 3; // Heading level for the section title
}

// Helper component to render sections with a title and content
const PolicySection = ({ title, children, level = 2 }: PolicySectionProps) => {
  const HeadingTag: React.ElementType = `h${level}`;
  return (
    <div className="mb-6">
      <HeadingTag className={`font-semibold text-gray-800 ${level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'} mb-3 pb-2 border-b border-gray-300`}>
        {title}
      </HeadingTag>
      <div className="text-gray-700 space-y-3 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

// Helper component for list items
const ListItem = ({ children }: React.PropsWithChildren) => <li className="ml-5 list-disc list-outside">{children}</li>;

export default async function PrivacyPage() {
  const locale = await getLocaleFromRequest();
  const categories = await getCategories(locale);

  const platformName = "Valora AI";
  const websiteUrl = "www.valoraai.net";
  const contactEmail = "contact@valoraai.net";

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation categories={categories} />
      <main className="py-8 container mx-auto px-4 flex-grow">
        <div className="col-start-3 row-start-1 max-sm:col-span-full max-sm:col-start-1 px-4 pt-12 sm:px-2 sm:pt-24">
          <h1 className="line-y py-2 text-5xl tracking-tight sm:text-6xl text-pretty">Privacy Policy</h1>
          <p className="line-y mt-6 max-w-2xl py-2 text-lg/7 font-medium text-pretty text-gray-600">Last updated on June 5, 2025</p>
          <div className="p-6 md:p-10 my-8 font-inter">
            <p className="mb-6 text-gray-700 leading-relaxed">
              Welcome to {platformName} (the "Platform," "we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website {websiteUrl} and use our mobile application and services (collectively, the "Services"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access or use the Services.
            </p>

            <PolicySection title="1. Information We Collect" level={2}>
              <p>We may collect information about you in a variety of ways. The information we may collect via the Services includes:</p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">a. Personal Data You Provide to Us:</h3>
              <ul className="space-y-2">
                <ListItem>
                  <strong>Account Information:</strong> When you register for an account, we may collect your name, email address, phone number (e.g., for account verification purposes or to facilitate direct communication between users for transactions, with your consent), username, password, and neighborhood or general location information you provide (e.g., city, postal code).
                </ListItem>
                <ListItem>
                  <strong>Listing Information:</strong> When you create a listing to sell an item, we collect information you provide about the item, including descriptions, photos, price, and category.
                </ListItem>
                <ListItem>
                  <strong>Transaction Information:</strong> While we are not a party to transactions, we may collect information related to your offers, purchases, or sales made through the Platform to facilitate communication and record-keeping within the Platform. We do not process payments directly; payment processing is handled by third-party payment processors (if applicable).
                </ListItem>
                <ListItem>
                  <strong>Communications:</strong> If you contact us directly or communicate with other users through our Platform's messaging features, we may collect the content of those communications.
                </ListItem>
                <ListItem>
                  <strong>Profile Information:</strong> You may choose to provide additional information as part of your user profile.
                </ListItem>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">b. Information Automatically Collected:</h3>
              <ul className="space-y-2">
                <ListItem>
                  <strong>Usage Data:</strong> We may automatically collect information about your access to and use of the Services, such as your IP address, browser type, operating system, device information, pages viewed, links clicked, the dates and times of your access, and other actions you take on the Platform.
                </ListItem>
                <ListItem>
                  <strong>Device Information:</strong> We may collect information about the computer or mobile device you use to access our Services, including the hardware model, operating system and version, unique device identifiers, and mobile network information.
                </ListItem>
                <ListItem>
                  <strong>Location Information:</strong> With your permission, we may collect information about the precise location of your device to help you find items or users in your neighborhood. You can change your location data permissions in your device settings. We will always collect general location information (e.g., based on IP address or information you provide like city/postal code) to provide neighborhood-specific services.
                </ListItem>
                <ListItem>
                  <strong>Cookies and Tracking Technologies:</strong> We may use cookies, web beacons, pixel tags, and other tracking technologies to collect information about your interaction with our Services, to remember your preferences, and to personalize your experience. You can control the use of cookies at the individual browser level.
                </ListItem>
              </ul>
            </PolicySection>

            <PolicySection title="2. How We Use Your Information" level={2}>
              <p>We use the information we collect for various purposes, including:</p>
              <ul className="space-y-2">
                <ListItem>To provide, operate, and maintain our Services.</ListItem>
                <ListItem>To create and manage your account.</ListItem>
                <ListItem>To facilitate listings, buying, and selling of items between users.</ListItem>
                <ListItem>To enable communication between users.</ListItem>
                <ListItem>To personalize and improve your experience on the Platform.</ListItem>
                <ListItem>To send you technical notices, updates, security alerts, and support and administrative messages.</ListItem>
                <ListItem>To respond to your comments, questions, and requests, and provide customer service.</ListItem>
                <ListItem>To communicate with you about products, services, offers, promotions, and events offered by {platformName} and others, and provide news and information we think will be of interest to you (with your consent, where required by law).</ListItem>
                <ListItem>To monitor and analyze trends, usage, and activities in connection with our Services.</ListItem>
                <ListItem>To detect, investigate, and prevent fraudulent transactions and other illegal activities and protect the rights and property of {platformName} and others.</ListItem>
                <ListItem>To enforce our Terms of Use and other policies.</ListItem>
                <ListItem>For legal compliance, such as responding to legal process or government requests.</ListItem>
                <ListItem>For any other purpose with your consent.</ListItem>
              </ul>
            </PolicySection>

            <PolicySection title="3. How We Share Your Information" level={2}>
              <p>We may share your information in the following situations:</p>
              <ul className="space-y-2">
                <ListItem>
                  <strong>With Other Users:</strong> When you list an item, your name, contact information, listing details (including photos and description), and general location (e.g., neighborhood) will be visible to other users. When you communicate with another user or engage in a transaction, we will share information necessary to facilitate that interaction (e.g., name, phone, messages). We do not share your precise location with other users unless you explicitly choose to do so.
                </ListItem>
                <ListItem>
                  <strong>With Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who perform services on our behalf, such as hosting, data analytics, customer service, email delivery, and marketing assistance. These service providers will only have access to your information to the extent necessary to perform their functions and are obligated to protect your information.
                </ListItem>
                <ListItem>
                  <strong>For Legal Reasons:</strong> We may disclose your information if we believe it's necessary to comply with a legal obligation, protect and defend our rights or property, prevent fraud, protect the safety of our users or the public, or protect against legal liability.
                </ListItem>
                <ListItem>
                  <strong>Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company, your information may be transferred.
                </ListItem>
                <ListItem>
                  <strong>With Your Consent:</strong> We may share your information for any other purpose with your explicit consent.
                </ListItem>
              </ul>
              <p className="mt-3 font-semibold">We do not sell your personal information to third parties.</p>
            </PolicySection>

            <PolicySection title="4. Cookies and Tracking Technologies" level={2}>
              <p>
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </PolicySection>

            <PolicySection title="5. Data Retention" level={2}>
              <p>
                We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
              </p>
            </PolicySection>

            <PolicySection title="6. Data Security" level={2}>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
              </p>
            </PolicySection>

            <PolicySection title="7. Your Rights and Choices" level={2}>
              <p>Certain jurisdictions provide data subjects with certain statutory rights to their Personal Information. Subject to exemptions provided by law, and with proper identification, you may have the right to certain actions to your Personal Information such as:</p>
              <ul className="space-y-2">
                <ListItem>Access, correct, update, or request deletion of your personal information.</ListItem>
                <ListItem>Object to processing of your personal information, ask us to restrict processing of your personal information, or request portability of your personal information.</ListItem>
                <ListItem>Opt-out of marketing communications we send you at any time.</ListItem>
                <ListItem>Withdraw your consent at any time if we have collected and processed your personal information with your consent.</ListItem>
              </ul>
              <p className="mt-3">To exercise these rights, please contact us using the contact details provided below. We will respond to your request in accordance with applicable law.</p>
            </PolicySection>

            <PolicySection title="8. Children's Privacy" level={2}>
              <p>
                Our Services are not intended for use by children under the age of 13 (or a higher age threshold where applicable law requires). We do not knowingly collect personal information from children under this age. If we learn that we have collected personal information from a child under the relevant age without parental consent, we will take steps to delete that information. If you believe that we might have any information from or about a child under the relevant age, please contact us.
              </p>
            </PolicySection>

            <PolicySection title="9. International Data Transfers" level={2}>
              <p>
                Because {platformName} operates globally, it may be necessary for us to transfer information, including Personal Information, to other countries than the country in which the information was collected. In these instances, we will transfer your data in accordance with the provisions of the applicable privacy legislation meant to safeguard the processing of your Personal Information.
              </p>
            </PolicySection>

            <PolicySection title="10. Changes to This Privacy Policy" level={2}>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page. We may also provide notice of material changes in other ways, such as through the Services or by email.
              </p>
            </PolicySection>

            <PolicySection title="11. Contact Us" level={2}>
              <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
              <div className="mt-2 space-y-1">
                <p><strong>{platformName}</strong></p>
                <p>Email: <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">{contactEmail}</a></p>
              </div>
            </PolicySection>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
