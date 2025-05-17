from fastapi import Request


def find_category_by_title(list_of_category, value):
    try:
        return next(cat for cat in list_of_category if cat.title == value)
    except StopIteration:
        return None


def get_client_ip(request: Request):
    client_ip = None

    # Check for True-Client-IP (often from Cloudflare, which Render might use or you might have configured)
    true_client_ip = request.headers.get("true-client-ip")
    if true_client_ip:
        client_ip = true_client_ip
    else:
        # Check for CF-Connecting-IP (another Cloudflare header)
        cf_connecting_ip = request.headers.get("cf-connecting-ip")
        if cf_connecting_ip:
            client_ip = cf_connecting_ip
        else:
            # Check for X-Forwarded-For
            x_forwarded_for = request.headers.get("x-forwarded-for")
            if x_forwarded_for:
                # X-Forwarded-For can be a comma-separated list of IPs
                # The first IP in the list is the original client IP
                client_ip = x_forwarded_for.split(",")[0].strip()
            else:
                # Fallback to X-Real-IP
                x_real_ip = request.headers.get("x-real-ip")
                if x_real_ip:
                    client_ip = x_real_ip
                else:
                    # If no proxy headers are found, fall back to request.client.host
                    # This will be Render's proxy IP in most cases on the platform
                    client_ip = request.client.host

    return client_ip
