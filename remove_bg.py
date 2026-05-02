from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # The background is very dark navy.
        # If it's dark, make it transparent.
        intensity = (r + g + b) / 3
        if intensity < 50:
            # Make dark pixels fully transparent
            new_data.append((r, g, b, 0))
        elif intensity < 100:
            # Semi-transparent for edges
            alpha = int((intensity - 50) / 50 * 255)
            new_data.append((r, g, b, alpha))
        else:
            # Keep bright pixels (gold) opaque
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

remove_background("assets/logo.jpg", "assets/logo_transparent.png")
