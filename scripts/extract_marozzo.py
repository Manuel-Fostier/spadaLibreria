import pdfplumber
import re
import argparse
import yaml


class TextElement:
    def __init__(self, text, index):
        self.text = text
        self.index = index


class Title(TextElement):
    def __init__(self, text, index):
        super().__init__(text, index)
        self.titles_1_list = [Title1("", 0, self)]
        self.SIZE = 80


class Title1(TextElement):
    def __init__(self, text, index, title):
        super().__init__(text, index)
        self.parent_title = title
        self.chapter_list = [Chapter("", 0, self)]
        self.SIZE = 25


class Chapter(TextElement):
    def __init__(self, text, index, title1):
        super().__init__(text, index)
        self.parent_title1 = title1
        self.paragraph_list = []
        self.SIZE = 20


class Paragraph(TextElement):
    def __init__(self, text, index, chapter):
        super().__init__(text, index)
        self.parent_chapter = chapter


def add_title(titles, text, index):
    if len(titles) == 1 and titles[0].text == "":
        titles[0] = Title(text.strip(), 0)
    else:
        titles.append(Title(text.strip(), index))


def add_title1(text, index, title):
    title.titles_1_list.append(Title1(text.strip(), index, title))


def add_chapter(text, index, title_1):
    title_1.chapter_list.append(Chapter(text.strip(), index, title_1))


def create_and_append_paragraphs(text, chapter):
    if text == "":
        return ""

    # Split the accumulated text into paragraphs
    paragraphs_text = re.split(r"\n(?=[A-ZÉÈÊËÀÂÎÔÛÜÇ])", text)
    # Associate each Paragraph to current Chapter
    for para_index, para in enumerate(paragraphs_text, start=1):
        chapter.paragraph_list.append(Paragraph(para, para_index, chapter))


def extract_text_elements(pdf_path, page_range):

    # Ajuster la plage de pages pour l'indexage à partir de zéro
    adjusted_page_range = [page - 1 for page in page_range]
    # Lire le fichier PDF
    words = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num in adjusted_page_range:
            page = pdf.pages[page_num]
            words += page.extract_words(keep_blank_chars=True,
                                        extra_attrs=["size"])
    titles = [Title("", 0)]
    current_title = titles[0]
    current_title_text = ""
    title_index = 1

    current_title_1 = current_title.titles_1_list[0]
    current_title_1_text = ""
    title_1_index = 1

    current_chapter = current_title.titles_1_list[0].chapter_list[0]
    current_chapter_text = ""
    chapter_index = 1

    text_content = ""
    previous_word_size = 0
    word_text = ""

    for i, word in enumerate(words):
        word_text = word["text"]
        if word_text != " ":
            current_word_size = round(word["size"])

            # Set previous_word_size value on first run
            if previous_word_size == 0:
                previous_word_size = current_word_size

            if current_word_size != previous_word_size:
                if previous_word_size == current_title.SIZE:
                    add_title(titles, current_title_text, len(titles))
                    current_title = titles[-1]
                    current_title_1 = current_title.titles_1_list[0]
                    current_chapter = current_title.titles_1_list[0].chapter_list[0]
                    title_index += 1
                    current_title_text = ""
                elif previous_word_size == current_title_1.SIZE:
                    add_title1(current_title_1_text,
                               title_1_index, current_title)
                    current_title_1 = current_title.titles_1_list[-1]
                    current_chapter = current_title_1.chapter_list[0]
                    title_1_index += 1
                    current_title_1_text = ""
                elif previous_word_size == current_chapter.SIZE:
                    add_chapter(current_chapter_text,
                                chapter_index, current_title_1)
                    current_chapter = current_title_1.chapter_list[-1]
                    chapter_index += 1
                    current_chapter_text = ""
                else:
                    create_and_append_paragraphs(text_content, current_chapter)
                    text_content = ""

            if current_word_size == current_title.SIZE:
                current_title_text += word_text
            elif current_word_size == current_title_1.SIZE:
                current_title_1_text += word_text
            elif current_word_size == current_chapter.SIZE:
                current_chapter_text += word_text
            else:
                # Add a newline if the difference in doctop between the current and next word is greater than 3
                # diff entre deux lignes 14, entre deux paragraphes 25,9
                if (i < len(words) - 1 and abs(words[i + 1]["doctop"] - word["doctop"]) > 20):
                    text_content += word_text
                    text_content += "\n"
                else:
                    text_content += word_text

            previous_word_size = current_word_size

    # Taking account last paragraph of the last page
    if text_content.split():
        create_and_append_paragraphs(text_content, current_chapter)

    return titles

def extract_chapter_number(title):
    """Extrait le numéro de chapitre du titre (ex: 'Chap. 94' ou 'Chapitre 95')"""
    # Pattern pour 'Chap. XXX' ou 'Chapitre XXX' (insensible à la casse)
    pattern = r'(?:chap|chapitre)\s*\.?\s*(\d+)'
    match = re.search(pattern, title, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None

def convert_to_yaml_structure(title_list, config, debug=False):
    """Convertit la structure extraite en format YAML conforme"""
    sections = []
    
    for title in title_list:
        for title1 in title.titles_1_list:
            for chapter in title1.chapter_list:
                if not chapter.text or chapter.text.strip() == "":
                    continue
                
                # Extraire le vrai numéro de chapitre depuis le titre
                chapter_number = extract_chapter_number(chapter.text)
                if chapter_number is None:
                    chapter_number = chapter.index
                
                if debug:
                    print(f"DEBUG - Titre: {chapter.text}")
                    print(f"DEBUG - Chapter number extrait: {chapter_number}")
                
                # Fusionner tous les paragraphes avec des retours à la ligne
                paragraphs_text = "\n".join([p.text for p in chapter.paragraph_list if p.text.strip()])
                
                section = {
                    "id": f"{config['master_id']}_l{config['book']}_c{chapter_number}",
                    "title": chapter.text,
                    "metadata": {
                        "master": config["master_id"],
                        "work": config["work"],
                        "book": config["book"],
                        "chapter": chapter_number,
                        "year": config["year"]
                    },
                    "content": {
                        "fr": paragraphs_text
                    }
                }
                sections.append(section)
    
    return sections

def parse_page_range(input_str):
    try:
        # Vérifier si input_str contient des caractères non numériques ou spéciaux autres que '-'
        if any(not char.isdigit() and char != "-" for char in input_str):
            raise ValueError(
                "Erreur : L'entrée contient des caractères non numériques ou spéciaux autres que '-'."
            )

        # Vérifier si '-' est le premier ou le dernier caractère
        if input_str.startswith("-") or input_str.endswith("-"):
            raise ValueError(
                "Erreur : '-' ne peut pas être le premier ou le dernier caractère."
            )

        if "-" in input_str:
            # Cas où l'entrée est de la forme "start-end"
            start, end = map(int, input_str.split("-"))
            if start == 0 or end == 0:
                raise ValueError("Erreur : La page 0 n'est pas valide.")
            return range(start, end + 1)
        elif "," in input_str:
            # Cas où l'entrée est de la forme "page1, page2, page3, ..."
            pages = list(map(int, input_str.split(",")))
            if 0 in pages:
                raise ValueError("Erreur : La page 0 n'est pas valide.")
            return pages
        else:
            # Cas où l'entrée est un seul numéro de page
            page = int(input_str)
            if page == 0:
                raise ValueError("Erreur : La page 0 n'est pas valide.")
            return [page]
    except ValueError as e:
        print(e)
        return []

def main():
    parser = argparse.ArgumentParser(
        description="Extraire le texte d'un PDF de traité d'escrime",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples d'utilisation:
  uv run scripts/extract_marozzo.py marozzo --pages "34-102"
  uv run scripts/extract_marozzo.py manciolino --pages "1-50"
  uv run scripts/extract_marozzo.py marozzo --pages "32,34,60,63"
        """
    )
    
    # Mapping des auteurs/livres vers leurs fichiers PDF et métadonnées
    PDF_MAPPING = {
        "marozzo": {
            "pdf": "data/treatises/Achille Marozzo - opéra nova.pdf",
            "master": "Achille Marozzo",
            "master_id": "achille_marozzo",
            "work": "Opera Nova",
            "book": 1,
            "year": 1536
        },
        "marozzo_l2": {
            "pdf": "data/treatises/Achille Marozzo - opéra nova - livre 2.pdf",
            "master": "Achille Marozzo",
            "master_id": "achille_marozzo",
            "work": "Opera Nova",
            "book": 2,
            "year": 1536
        },
        "manciolino": {
            "pdf": "data/treatises/Antonio Manciolino - opéra nova.pdf",
            "master": "Antonio Manciolino",
            "master_id": "antonio_manciolino",
            "work": "Opera Nova",
            "book": 1,
            "year": 1531
        },
    }
    
    parser.add_argument(
        "author",
        type=str,
        choices=PDF_MAPPING.keys(),
        help="Nom de l'auteur (marozzo ou manciolino)"
    )
    
    parser.add_argument(
        "--pages",
        type=str,
        required=True,
        help="Plage de pages à extraire (ex: 32-65 ou 32,34,60,63)"
    )
    
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Afficher les informations de debug"
    )
    
    args = parser.parse_args()
    
    config = PDF_MAPPING[args.author]
    pdf_path = config["pdf"]
    search_range = args.pages

    page_range = parse_page_range(search_range)
    if not page_range:
        print("Plage invalide !")
    else:
        title_list = extract_text_elements(pdf_path, page_range)

        # Debug: Afficher la structure extraite
        for title in title_list:
            print(f"Titre: {title.text}")            
            for title1 in title.titles_1_list:
                print(f"  Titre1: {title1.text}")
                for chapter in title1.chapter_list:
                    print(f"    Chapitre: {chapter.text}")
                    for paragraph in chapter.paragraph_list:
                        print(f"      Paragraphe: {paragraph.text}")                

        # Convertir en structure YAML
        sections = convert_to_yaml_structure(title_list, config, debug=args.debug)

        # Sauvegarder dans le fichier YAML
        output_filename = f"data/treatises/{config['master_id']}_opera_nova_livre{config['book']}.yaml"
        with open(output_filename, 'w', encoding='utf-8') as f:
            yaml.dump(sections, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

        print(f"Fichier YAML généré : {output_filename}")
        print(f"Nombre de sections : {len(sections)}")

if __name__ == "__main__":
    main()
