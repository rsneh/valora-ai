"""seed_initial_categories_data

Revision ID: 3a27958221e2
Revises: 6ab253f651cc
Create Date: 2025-05-20 20:53:10.194250

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column


# revision identifiers, used by Alembic.
revision: str = "3a27958221e2"
down_revision: Union[str, None] = "6ab253f651cc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define the categories table structure for the migration
# This helps Alembic understand what table it's inserting into,
# especially if the models themselves are not easily importable in migrations.
categories_table = table(
    "categories",
    column("category_key", sa.String),
    column("parent_category_key", sa.String),
    column("name_en", sa.String),
    column("name_he", sa.String),
    column("description_ui_en", sa.String),
    column("description_ui_he", sa.String),
    column("description_for_ai", sa.Text),
    column("sort_order", sa.Integer),
    column("is_active", sa.Boolean),
)

# Data based on valora_detailed_category_list_yad2
# Ensure parent categories are defined before their children if order matters for your DB/constraints.
# For bulk_insert, it's often fine, but this order is safer.
all_categories_data = [
    # Top-Level Categories
    {
        "category_key": "electronics",
        "parent_category_key": None,
        "name_en": "Electronics",
        "name_he": "אלקטרוניקה",
        "description_ui_en": "Gadgets, devices, computers, consoles.",
        "description_ui_he": "גאדג'טים, מכשירים, מחשבים, קונסולות.",
        "description_for_ai": "Main category for consumer electronics, gadgets, and devices such as smartphones, computers, gaming consoles, TVs, cameras, and audio equipment.",
        "sort_order": 10,
        "is_active": True,
    },
    {
        "category_key": "mobile_devices",
        "parent_category_key": None,
        "name_en": "Mobile Devices & Accessories",
        "name_he": "מכשירים סלולריים ואביזרים",
        "description_ui_en": "Smartphones, mobile accessories.",
        "description_ui_he": "סמארטפונים, אביזרים לסלולר.",
        "description_for_ai": "Category for mobile phones (smartphones) and related accessories like chargers, cases, and screen protectors.",
        "sort_order": 20,
        "is_active": True,
    },
    {
        "category_key": "fashion",
        "parent_category_key": None,
        "name_en": "Fashion & Accessories",
        "name_he": "אופנה ואקססוריז",
        "description_ui_en": "Clothing, shoes, bags, jewelry.",
        "description_ui_he": "ביגוד, נעליים, תיקים, תכשיטים.",
        "description_for_ai": "Category for all types of clothing, footwear, bags, jewelry, watches, and other fashion accessories for men, women, and children.",
        "sort_order": 30,
        "is_active": True,
    },
    {
        "category_key": "home_goods",
        "parent_category_key": None,
        "name_en": "Home Goods & Furniture",
        "name_he": "ריהוט ועיצוב הבית",
        "description_ui_en": "Furniture, decor, kitchen items.",
        "description_ui_he": "ריהוט, עיצוב, כלי מטבח.",
        "description_for_ai": "Category for items that furnish and decorate a home, including furniture for all rooms, home decor items, kitchenware, and appliances.",
        "sort_order": 40,
        "is_active": True,
    },
    {
        "category_key": "kids_babies",
        "parent_category_key": None,
        "name_en": "Kids & Babies",
        "name_he": "ילדים ותינוקות",
        "description_ui_en": "Gear, furniture, clothing, toys.",
        "description_ui_he": "ציוד, ריהוט, ביגוד, צעצועים.",
        "description_for_ai": "Category for items related to children and babies, including baby gear (strollers, car seats), kids' furniture, clothing, toys, and feeding supplies.",
        "sort_order": 50,
        "is_active": True,
    },
    {
        "category_key": "sports_leisure",
        "parent_category_key": None,
        "name_en": "Sports & Leisure",
        "name_he": "ספורט ופנאי",
        "description_ui_en": "Fitness, cycling, outdoor gear.",
        "description_ui_he": "כושר, אופניים, ציוד חוץ.",
        "description_for_ai": "Category for sports equipment, fitness gear, bicycles, scooters, camping supplies, and items for outdoor activities and leisure.",
        "sort_order": 60,
        "is_active": True,
    },
    {
        "category_key": "media",
        "parent_category_key": None,
        "name_en": "Books, Music & Media",
        "name_he": "ספרים, מוזיקה ומדיה",
        "description_ui_en": "Books, CDs, vinyl, movies.",
        "description_ui_he": "ספרים, דיסקים, תקליטים, סרטים.",
        "description_for_ai": "Category for physical media including books, magazines, comics, vinyl records, CDs, DVDs, and Blu-ray discs.",
        "sort_order": 70,
        "is_active": True,
    },
    {
        "category_key": "collectibles_art",
        "parent_category_key": None,
        "name_en": "Collectibles & Art",
        "name_he": "אספנות ואומנות",
        "description_ui_en": "Antiques, art, trading cards.",
        "description_ui_he": "עתיקות, אומנות, קלפי אספנות.",
        "description_for_ai": "Category for unique, rare, or vintage items, trading cards, action figures, antiques, art, sculptures, and hobbyist collectibles.",
        "sort_order": 80,
        "is_active": True,
    },
    {
        "category_key": "music_instruments",
        "parent_category_key": None,
        "name_en": "Musical Instruments",
        "name_he": "כלי נגינה",
        "description_ui_en": "Guitars, keyboards, drums, accessories.",
        "description_ui_he": "גיטרות, קלידים, תופים, אביזרים.",
        "description_for_ai": "Category for all types of musical instruments and related accessories, including guitars, keyboards, pianos, drums, wind, and string instruments.",
        "sort_order": 90,
        "is_active": True,
    },
    {
        "category_key": "tools_home_improvement",
        "parent_category_key": None,
        "name_en": "Tools & Home Improvement",
        "name_he": "כלים ושיפוץ הבית",
        "description_ui_en": "Power tools, hand tools, materials.",
        "description_ui_he": "כלי עבודה חשמליים, ידניים, חומרים.",
        "description_for_ai": "Category for power tools, hand tools, gardening tools, building materials, and fixtures for home improvement and DIY projects.",
        "sort_order": 100,
        "is_active": True,
    },
    {
        "category_key": "other",
        "parent_category_key": None,
        "name_en": "Other",
        "name_he": "שונות",
        "description_ui_en": "Items not fitting elsewhere.",
        "description_ui_he": "פריטים שלא מתאימים לקטגוריות אחרות.",
        "description_for_ai": "Fallback category for miscellaneous items that do not clearly fit into any other predefined category.",
        "sort_order": 999,
        "is_active": True,
    },
    # --- Sub-Categories for Electronics ---
    {
        "category_key": "electronics_laptops_computers",
        "parent_category_key": "electronics",
        "name_en": "Laptops & Computers",
        "name_he": "לפטופים ומחשבים",
        "description_ui_en": "Laptops, desktops, tablets, accessories.",
        "description_ui_he": "ניידים, שולחניים, טאבלטים, אביזרים.",
        "description_for_ai": "Category: Electronics - Laptops & Computers. Includes: Laptops (מחשבים ניידים), Ultrabooks, MacBooks, Chromebooks, Gaming Laptops, Desktop Computers (מחשבים שולחניים), All-in-One PCs, Tablets (טאבלטים), iPads, Android Tablets, e-readers (Kindle, Kobo), Computer Monitors (צגי מחשב), Keyboards, Mice, Webcams, Computer Speakers, External Hard Drives, SSDs, USB Drives, Printers, Scanners, Computer Components (CPU, GPU, RAM, Motherboard), Networking (Routers, Modems, Switches - מוצרי רשת), GPS Navigation Systems. Excludes smartphones.",
        "sort_order": 11,
        "is_active": True,
    },
    {
        "category_key": "electronics_tv_audio_video",
        "parent_category_key": "electronics",
        "name_en": "TVs & Home Audio/Video",
        "name_he": "טלוויזיות ומערכות קולנוע ביתי",
        "description_ui_en": "TVs, sound systems, projectors.",
        "description_ui_he": "טלוויזיות, מערכות סאונד, מקרנים.",
        "description_for_ai": "Category: Electronics - TVs & Home Audio/Video. Includes: Televisions (טלוויזיות), Smart TVs, LED, OLED, QLED TVs, Home Theater Systems (מערכות קולנוע ביתי), Soundbars, Speakers (רמקולים), Subwoofers, AV Receivers (רסיברים), Projectors (מקרנים), Streaming Devices (Apple TV, Chromecast, Roku, Fire Stick - נגני מדיה ביתיים וסטרימינג), DVD/Blu-ray Players, Karaoke Sets (ערכות קריוקי), DJ Systems (מערכות דיג'יי), Microphones (מיקרופונים), Audio Amplifiers (מגברי אודיו).",
        "sort_order": 12,
        "is_active": True,
    },
    # ... (Add ALL other sub-categories from your valora_detailed_category_list_yad2 document here, following the same pattern) ...
    # Example for one more sub-category:
    {
        "category_key": "electronics_gaming_consoles_games",
        "parent_category_key": "electronics",
        "name_en": "Gaming Consoles & Games",
        "name_he": "משחקים וקונסולות",
        "description_ui_en": "Consoles, video games, VR.",
        "description_ui_he": "קונסולות, משחקי וידאו, VR.",
        "description_for_ai": "Category: Electronics - Gaming Consoles & Games. Includes: Game Consoles (קונסולות משחק) like PlayStation (PS5, PS4), Xbox (Series X/S, One), Nintendo Switch, Steam Deck, retro consoles, Video Games (משחקי וידאו) for these consoles and PC, VR Headsets (משקפי VR), Gaming Controllers, Gaming Headsets, and other console/gaming accessories (אביזרים לקונסולות).",
        "sort_order": 13,
        "is_active": True,
    },
    # --- Sub-Categories for Mobile Devices ---
    {
        "category_key": "mobile_smartphones",
        "parent_category_key": "mobile_devices",
        "name_en": "Smartphones",
        "name_he": "סמארטפונים",
        "description_ui_en": "iPhones, Android, other smartphones.",
        "description_ui_he": "אייפונים, אנדרואיד, סמארטפונים אחרים.",
        "description_for_ai": "Category: Mobile Devices - Smartphones. Includes: iPhones (all models), Samsung Galaxy, Google Pixel, Xiaomi, OnePlus, and other Android or iOS smartphones. Mobile phones.",
        "sort_order": 21,
        "is_active": True,
    },
    {
        "category_key": "mobile_accessories",
        "parent_category_key": "mobile_devices",
        "name_en": "Mobile Accessories",
        "name_he": "אביזרים לסלולר",
        "description_ui_en": "Chargers, cases, screen protectors.",
        "description_ui_he": "מטענים, כיסויים, מגני מסך.",
        "description_for_ai": "Category: Mobile Devices - Accessories. Includes: Phone Chargers (מטענים לסלולר), Power Banks, Phone Cases (כיסויים), Screen Protectors (מגני מסך), Mobile Phone Holders, Car Mounts, Selfie Sticks, PopSockets, Bluetooth Earpieces/Headsets for calls (דיבוריות - if not covered by general headphones).",
        "sort_order": 22,
        "is_active": True,
    },
    # --- Sub-Categories for Fashion ---
    {
        "category_key": "fashion_womens_clothing",
        "parent_category_key": "fashion",
        "name_en": "Women's Clothing",
        "name_he": "ביגוד נשים",
        "description_ui_en": "Dresses, tops, pants, outerwear.",
        "description_ui_he": "שמלות, חולצות, מכנסיים, הלבשה עליונה.",
        "description_for_ai": "Category: Fashion - Women's Clothing. Includes: Dresses (שמלות), Skirts (חצאיות), Tops, Blouses, T-shirts (חולצות), Sweaters, Cardigans, Pants, Jeans, Leggings (מכנסיים), Shorts, Jumpsuits, Rompers (אוברולים), Coats, Jackets (מעילים וז'קטים), Blazers, Suits (חליפות), Lingerie, Sleepwear (פיג'מות וחלוקים), Swimwear (בגדי ים), Activewear, Maternity wear.",
        "sort_order": 31,
        "is_active": True,
    },
    {
        "category_key": "fashion_mens_clothing",
        "parent_category_key": "fashion",
        "name_en": "Men's Clothing",
        "name_he": "ביגוד גברים",
        "description_ui_en": "Shirts, pants, jackets, suits.",
        "description_ui_he": "חולצות, מכנסיים, ז'קטים, חליפות.",
        "description_for_ai": "Category: Fashion - Men's Clothing. Includes: Shirts (חולצות), T-shirts, Polos, Sweaters, Hoodies, Pants, Jeans, Chinos (מכנסיים), Shorts, Suits (חליפות), Blazers, Jackets, Coats (מעילים וז'קטים), Underwear, Socks, Sleepwear (פיג'מות וחלוקים), Swimwear (בגדי ים), Activewear.",
        "sort_order": 32,
        "is_active": True,
    },
]


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # Insert data into the categories table
    # Ensure the columns in bulk_insert match your categories_table definition
    # and the keys in your data dictionaries.
    op.bulk_insert(categories_table, all_categories_data)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # This will delete ALL data from the categories table.
    # If you only want to delete the specific data inserted by this migration,
    # you would need more specific DELETE statements with WHERE clauses based on category_key.
    # For a seed data migration, deleting all is often acceptable for downgrade.
    op.execute(f"DELETE FROM {categories_table.name}")
    # ### end Alembic commands ###
