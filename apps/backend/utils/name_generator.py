import random

def generate_random_name():
    adjectives = ["강력한", "날쌘", "정확한", "화려한"]
    nouns = ["스매싱", "셔틀콕", "라켓", "네트"]
    random_adjective = random.choice(adjectives)
    random_noun = random.choice(nouns)
    random_number = random.randint(1, 99)
    return f"{random_adjective}{random_noun}{random_number}"