def find_category_by_title(list_of_category, value):
    try:
        return next(cat for cat in list_of_category if cat.title == value)
    except StopIteration:
        return None
