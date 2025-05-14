from typing import List, Optional


class Category:
    """
    Category class representing a category of items.
    """

    value: str
    label: str
    description: str
    icon: str
    show: bool = True
    prompt: Optional[str] = None

    def __init__(
        self,
        value: str,
        label: str,
        description: Optional[str] = None,
        icon: Optional[str] = None,
        show: bool = False,
        prompt: Optional[str] = None,
    ):
        self.value = value
        self.label = label
        self.description = description
        self.icon = icon
        self.show = show
        self.prompt = prompt


CATEGORIES: List[Category] = [
    Category(
        value="electronics",
        label="Electronics",
        prompt="Category: Electronics. Includes consumer electronics, gadgets, and devices. Keywords: smartphone, iPhone, Android, laptop, computer, PC, MacBook, gaming console, PlayStation, Xbox, Nintendo Switch, video games, TV, television, smart TV, camera, DSLR, mirrorless, headphones, earbuds, speakers, Bluetooth, home audio, tablet, iPad, e-reader, Kindle, smartwatch, drone, chargers, cables, accessories for electronic devices.",
    ),
    Category(
        value="fashion",
        label="Fashion & Apparel",
        prompt="Category: Fashion & Apparel. Includes all types of clothing, footwear, and fashion accessories. Keywords: dress, shirt, t-shirt, pants, jeans, jacket, coat, sweater, suit, skirt, activewear, swimwear, shoes, sneakers, boots, heels, sandals, handbag, purse, backpack, wallet, jewelry, necklace, bracelet, earrings, ring, watch, scarf, hat, gloves, belt, sunglasses, men's fashion, women's fashion, children's clothing.",
    ),
    Category(
        value="home-goods",
        label="Home Goods & Furniture",
        prompt="Category: Home Goods & Furniture. Includes items for home living, decoration, and functionality. Keywords: furniture, sofa, couch, chair, table, desk, bed, mattress, bookshelf, cabinet, storage, home decor, rug, lamp, lighting, mirror, art, vase, curtains, cushions, kitchenware, cookware, bakeware, dishes, cutlery, utensils, small kitchen appliances (blender, toaster, coffee maker), home appliances (vacuum), bedding, towels, bathroom accessories, plants, planters, organization.",
    ),
    Category(
        value="collectibles",
        label="Collectibles & Hobbies",
        prompt="Category: Collectibles & Hobbies. Includes items sought by collectors, hobbyists, and enthusiasts. Keywords: collectible, antique, vintage, rare, memorabilia, trading cards (sports, Pokemon, TCG), action figures, dolls, model kits, stamps, coins, art prints, comics, graphic novels, musical instruments (guitar, keyboard, drums, violin), hobby supplies, craft supplies, board games, puzzles, vinyl records, LPs, retro gaming items (not consoles themselves if 'Electronics' is primary).",
    ),
    Category(
        value="books-media",
        label="Books & Media",
        prompt="Category: Books & Media. Includes physical media for reading, listening, or viewing. Keywords: book, hardcover, paperback, novel, textbook, magazine, comic book, graphic novel, vinyl record, LP, CD, album, DVD, Blu-ray, movie, TV series box set, audiobooks (physical format).",
    ),
    Category(
        value="sports-outdoors",
        label="Sports & Outdoors",
        prompt="Category: Sports & Outdoors. Includes gear for athletic activities, fitness, and outdoor recreation. Keywords: bicycle, bike, exercise equipment, treadmill, weights, yoga mat, fitness tracker (wearable if not under electronics), camping gear, tent, sleeping bag, hiking boots, backpack (outdoor specific), sporting goods, golf clubs, tennis racket, basketball, football, skis, snowboard, skateboard, scooter, fishing gear, outdoor apparel (specialized).",
    ),
    Category(
        value="other",
        label="Other",
        prompt="Category: Other. Use as a fallback if the item does not clearly fit into any other predefined category. This is for miscellaneous items. If an item has features from multiple categories, try to pick the most dominant one before defaulting to 'Other'.",
    ),
]


def find_category_by_name(name):
    try:
        return next(x for x in CATEGORIES if x.label == name)
    except StopIteration:
        return None
