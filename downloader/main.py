import yt_dlp
from pathlib import Path
import os
import shutil
import re
import json

ROOT = "BLIND_TEST"

def main():
    with open("test.json", encoding='utf-8') as file:
        data = json.load(file)
        download_file(data["tree"], ROOT)
    shutil.make_archive(ROOT, 'zip', ROOT)

def download_file(data, current_path):
    for item in data:
        if isinstance(item, dict):
            name = str(item["position"]) + "-" + nettoyer_nom_fichier(item.get("name", "inconnu"))
            link = item.get("link")
            children = item.get("childrens")

            new_path = os.path.join(current_path, name)

            if link:
                # Enregistre le fichier si un lien est présent
                save_link(name, link, current_path)
            elif children and len(children) > 0:
                # Crée le sous-dossier si ce n’est pas un lien
                os.makedirs(new_path, exist_ok=True)
                download_file(children, new_path)  # Récursivité


def nettoyer_nom_fichier(nom):
    # Remplace les caractères réservés par un underscore (_)
    return re.sub(r'[<>:"/\\|?*]', '_', nom)

def save_link(name, link, save_path):
    name += ".mp4"
    name = name.replace("|", "-").replace(" ", "-")

    """
    Télécharge une vidéo YouTube à partir de son URL.
    
    :param video_url: str, URL de la vidéo YouTube
    :param save_path: str, chemin où sauvegarder la vidéo (par défaut le répertoire courant)
    """

    try:
        ydl_opts = {
            'outtmpl': name,  # Set filename format
            'format': 'best',  # Choose the best available quality
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([link])
            output = ydl.extract_info(link, download=False).get('title', None)
            if not os.path.exists(save_path):
                os.makedirs(save_path)
            shutil.move(name, os.path.join(save_path, name))
    except Exception as e:
        print(f"Erreur lors du téléchargement : {e}")



if __name__ == '__main__':
    main()
