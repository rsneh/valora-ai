def find_category_by_name(list_of_category, value):
    try:
        return next(cat for cat in list_of_category if cat.label == value)
    except StopIteration:
        return None
