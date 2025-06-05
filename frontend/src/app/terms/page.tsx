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
  const jurisdiction = "USA / Israel";
  const noticePeriodForChanges = "30 days'";
  const contactEmailOrForm = "contact@valoraai.net";


  return (
    <div className="min-h-screen flex flex-col">
      <Navigation categories={categories} />
      <main className="py-8 container mx-auto px-4 flex-grow">
        <div className="col-start-3 row-start-1 max-sm:col-span-full max-sm:col-start-1 px-4 pt-12 sm:px-2 sm:pt-24">
          <h1 className="line-y py-2 text-5xl tracking-tight sm:text-6xl text-pretty">Terms of Use</h1>
          <p className="line-y mt-6 max-w-2xl py-2 text-lg/7 font-medium text-pretty text-gray-600">Last updated on June 5, 2025</p>
          <div className="p-6 md:p-10 my-8 font-inter">
            <p className="mb-6 text-gray-700 leading-relaxed">
              Welcome to {platformName} (the &quot;Platform&quot;), a neighborhood marketplace connecting individuals to buy and sell used goods. These Terms of Use (&quot;Terms&quot;) govern your access to and use of our Platform and services (collectively, the &quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services.
            </p>

            <PolicySection title="1. The Platform">
              <p>
                {platformName} provides an online platform that allows users to offer, sell, and buy used goods (&quot;Items&quot;) in their local neighborhood. We are a facilitator and are not a party to any transaction between buyers and sellers. We do not own, inspect, buy, or sell any Items listed on the Platform. The actual contract for sale is directly between the seller and buyer.
              </p>
            </PolicySection>

            <PolicySection title="2. Eligibility">
              <p>
                To use our Services, you must be at least 18 years old or the age of legal majority in your jurisdiction and capable of forming a binding contract. If you are using the Services on behalf of an organization or entity, you represent and warrant that you are authorized to agree to these Terms on their behalf and bind them to these Terms.
              </p>
            </PolicySection>

            <PolicySection title="3. User Accounts">
              <ul className="space-y-2">
                <ListItem>
                  <strong>Account Creation:</strong> You may need to register for an account to access certain features of the Platform. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </ListItem>
                <ListItem>
                  <strong>Account Responsibility:</strong> You are responsible for safeguarding your account password and for any activities or actions under your account, whether or not you have authorized such activities or actions. You agree to notify us immediately of any unauthorized use of your account.
                </ListItem>
                <ListItem>
                  <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account at our sole discretion, without notice, for any reason, including but not limited to a breach of these Terms.
                </ListItem>
              </ul>
            </PolicySection>

            <PolicySection title="4. Listing and Selling Items">
              <ul className="space-y-2">
                <ListItem>
                  <strong>Accurate Listings:</strong> If you list an Item for sale, you agree to provide accurate, complete, and truthful descriptions of the Item, including its condition, price, and any flaws. You are responsible for the content of your listings.
                </ListItem>
                <ListItem>
                  <strong>Prohibited Items:</strong> You agree not to list any Items that are illegal, counterfeit, stolen, hazardous, or otherwise violate our Prohibited Items Policy (which will be linked here or detailed in a separate section). We reserve the right to remove any listing that violates these Terms or our policies.
                </ListItem>
                <ListItem>
                  <strong>Seller Obligations:</strong> As a seller, you are responsible for setting the price, arranging for the exchange of the Item with the buyer, and ensuring the Item matches the description provided.
                </ListItem>
              </ul>
            </PolicySection>

            <PolicySection title="5. Buying Items">
              <ul className="space-y-2">
                <ListItem>
                  <strong>Buyer Responsibility:</strong> As a buyer, you are responsible for reading the full Item listing before making an offer or committing to buy. When you commit to buy an Item, you are entering into a legally binding contract with the seller.
                </ListItem>
                <ListItem>
                  <strong>Inspection:</strong> We encourage buyers to inspect Items in person (if applicable and safe to do so) before completing a transaction.
                </ListItem>
              </ul>
            </PolicySection>

            <PolicySection title="6. Transactions Between Users">
              <ul className="space-y-2">
                <ListItem>
                  <strong>No Endorsement:</strong> {platformName} does not endorse any user or any Item listed on the Platform. We do not guarantee the quality, safety, legality, or authenticity of Items, the truth or accuracy of listings, the ability of sellers to sell Items, or the ability of buyers to pay for Items.
                </ListItem>
                <ListItem>
                  <strong>Disputes:</strong> You agree that any dispute regarding an Item or transaction is solely between the buyer and the seller. {platformName} is not responsible for resolving disputes between users. However, we may, in our sole discretion, attempt to help mediate disputes.
                </ListItem>
                <ListItem>
                  <strong>Safety:</strong> You are solely responsible for your interactions with other users. We encourage you to take precautions when meeting other users in person. Choose safe, public locations for exchanges. {platformName} is not responsible for any harm or damage that occurs as a result of interactions between users.
                </ListItem>
              </ul>
            </PolicySection>

            <PolicySection title="7. User Conduct">
              <p>You agree not to:</p>
              <ul className="space-y-1 ml-5 list-disc list-outside">
                <li>Use the Services for any illegal or unauthorized purpose.</li>
                <li>Violate any applicable local, state, national, or international law.</li>
                <li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others.</li>
                <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.</li>
                <li>Submit false or misleading information.</li>
                <li>Upload or transmit viruses or any other type of malicious code.</li>
                <li>Collect or track the personal information of others.</li>
                <li>Spam, phish, pharm, pretext, spider, crawl, or scrape.</li>
                <li>Interfere with or circumvent the security features of the Service.</li>
                <li>Use the Platform to engage in any fraudulent activity.</li>
              </ul>
            </PolicySection>

            <PolicySection title="8. Intellectual Property">
              <ul className="space-y-2">
                <ListItem>
                  <strong>Our Content:</strong> All content on the Platform, including text, graphics, logos, icons, images, audio clips, and software, is the property of {platformName} or its content suppliers and is protected by international copyright and other intellectual property laws.
                </ListItem>
                <ListItem>
                  <strong>User Content:</strong> By posting content (e.g., listings, messages, reviews) on the Platform (&quot;User Content&quot;), you grant {platformName} a non-exclusive, worldwide, royalty-free, irrevocable, sublicensable, perpetual license to use, display, edit, modify, reproduce, distribute, store, and prepare derivative works of your User Content to provide the Services and to promote the Platform or the Services in general, in any formats and through any channels. You represent and warrant that you have all necessary rights to grant us this license.
                </ListItem>
              </ul>
            </PolicySection>

            <PolicySection title="9. Disclaimers of Warranties">
              <p className="font-semibold">
                THE SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE.
              </p>
              <p className="mt-2">
                {platformName.toUpperCase()} DOES NOT WARRANT THAT: (I) THE SERVICES WILL BE SECURE, UNINTERRUPTED, ERROR-FREE, OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION; (II) ANY DEFECTS OR ERRORS WILL BE CORRECTED; (III) THE SERVICES ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; OR (IV) THE RESULTS OF USING THE SERVICES WILL MEET YOUR REQUIREMENTS. YOUR USE OF THE SERVICES IS SOLELY AT YOUR OWN RISK.
              </p>
            </PolicySection>

            <PolicySection title="10. Limitation of Liability">
              <p className="font-semibold">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL {platformName.toUpperCase()}, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES, INCLUDING WITHOUT LIMITATION, ANY DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF OTHER USERS OR THIRD PARTIES; (III) ANY CONTENT OBTAINED FROM THE SERVICES; AND (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
              </p>
              <p className="mt-2">
                OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES SHALL NOT EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS (USD $100) OR THE AMOUNT YOU PAID {platformName}, IF ANY, IN THE PAST SIX MONTHS FOR THE SERVICES GIVING RISE TO THE CLAIM.
              </p>
              <p className="mt-2">
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
              </p>
            </PolicySection>

            <PolicySection title="11. Indemnification">
              <p>
                You agree to defend, indemnify, and hold harmless {platformName} and its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to your violation of these Terms or your use of the Services, including, but not limited to, your User Content, any use of the Platform&apos;s content, services, and products other than as expressly authorized in these Terms, or your use of any information obtained from the Services, or your interactions with other users.
              </p>
            </PolicySection>

            <PolicySection title="12. Governing Law and Dispute Resolution">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of {jurisdiction}, without regard to its conflict of law provisions.
              </p>
            </PolicySection>

            <PolicySection title="13. Changes to Terms">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least {noticePeriodForChanges} notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Services.
              </p>
            </PolicySection>

            <PolicySection title="14. Severability">
              <p>
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
            </PolicySection>

            <PolicySection title="15. Entire Agreement">
              <p>
                These Terms, together with our Privacy Policy and any other legal notices published by us on the Service, shall constitute the entire agreement between you and {platformName} concerning the Services.
              </p>
            </PolicySection>

            <PolicySection title="16. Contact Information">
              <p>If you have any questions about these Terms, please contact us at:
                <br />
                {contactEmailOrForm.startsWith("http") || contactEmailOrForm.startsWith("mailto:") ? (
                  <a href={contactEmailOrForm} className="text-blue-600 hover:underline">
                    {contactEmailOrForm.startsWith("mailto:") ? contactEmailOrForm.substring(7) : contactEmailOrForm}
                  </a>
                ) : (
                  contactEmailOrForm
                )}
              </p>
            </PolicySection>

            <PolicySection title="Prohibited Items Policy">
              <p>Users are prohibited from listing or selling the following items:</p>
              <ul className="space-y-1 ml-5 list-disc list-outside">
                <li>Illegal items or items promoting illegal activity</li>
                <li>Firearms, weapons, ammunition, and explosives</li>
                <li>Drugs, drug paraphernalia, and unapproved medical devices</li>
                <li>Alcohol and tobacco products (unless legally permitted and with appropriate licensing shown)</li>
                <li>Hazardous materials</li>
                <li>Counterfeit or replica items</li>
                <li>Stolen property</li>
                <li>Adult content or services</li>
                <li>Animals (subject to local regulations and ethical considerations)</li>
                <li>Recalled items</li>
                <li>Items that infringe on intellectual property rights</li>
              </ul>
              <p className="mt-2">
                This list is not exhaustive and {platformName} reserves the right to remove any listing it deems inappropriate or in violation of its policies.
              </p>
            </PolicySection>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
