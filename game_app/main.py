import os
import sys
from collections import deque
import re
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import vlc
import time
import threading
import serial
import serial.tools.list_ports

# Palette de couleurs cycliques pour chaque niveau de dossier
COLORS = ['red', 'green', 'blue', 'orange', 'purple', 'teal', 'brown']
ser = None
try:
    ser = serial.Serial( [p.device for p in serial.tools.list_ports.comports()][0], 115200, timeout=1)
    time.sleep(2)
    print(ser)
except Exception as e:
    print(f"Erreur série: {e}")

# Sons disponibles dans ./sounds
def list_sounds():
    sounds_dir = os.path.join(os.path.dirname(__file__), 'sounds')
    if not os.path.isdir(sounds_dir):
        return []
    return [f for f in os.listdir(sounds_dir) if f.lower().endswith('.mp3')]

# Parcours BFS pour lister .mp4
def list_mp4_bfs(root_path):
    queue = deque([root_path])
    mp4_files = []
    while queue:
        current = queue.popleft()
        try:
            with os.scandir(current) as it:
                subs = []
                for e in it:
                    if e.is_dir(): subs.append(e.path)
                    elif e.is_file() and e.name.lower().endswith('.mp4'):
                        mp4_files.append(e.path)
                queue.extend(subs)
        except (PermissionError, FileNotFoundError):
            continue
    return mp4_files

# Format mm:ss
def format_time(ms):
    s = int(ms/1000)
    m, s = divmod(s, 60)
    return f"{m:02d}:{s:02d}"

# Fenêtre Player
class AudioPlayer(tk.Toplevel):
    def __init__(self, master, track_list, root_path, teams, sounds, serial_port=None):
        super().__init__(master)
        self.root_path = root_path
        self.track_list = track_list
        self.index = 0
        self.serial_port = serial_port
        self.instance = vlc.Instance('--no-video')
        self.player = self.instance.media_player_new()
        self.sound_players = []
        self.sounds = sounds
        self._load_sounds()
        self.duration = 1
        self.playing = False
        self.start_time = 0
        self.paused_at = 0
        self.player.audio_set_volume(50)

        # Scores initiaux
        self.teams = [{'name': n, 'score': 0, 'sound': sounds[i] if i < len(sounds) else None} for i, n in enumerate(teams)]

        self.protocol("WM_DELETE_WINDOW", self._quit_all)
        self._load_track()
        self._build_ui()
        threading.Thread(target=self._auto_update, daemon=True).start()
        if self.serial_port:
            threading.Thread(target=self._listen_serial, daemon=True).start()

    def _load_sounds(self):
        # create VLC players for each team sound
        for snd in self.sounds:
            path = os.path.join(os.path.dirname(__file__), 'sounds', snd)
            inst = vlc.Instance()
            pl = inst.media_player_new()
            media = inst.media_new(path)
            pl.set_media(media)
            self.sound_players.append((snd,pl))

    def _play_team_sound(self, idx):
        if 0 <= idx < len(self.sound_players):
            self.sound_players[idx].play()
    
    def _play_team_sound(self, idx):
        if idx < len(self.sound_players):
            name, player = self.sound_players[idx]
            media_path = os.path.join(os.path.dirname(__file__), 'sounds', name)
            inst = vlc.Instance()
            media = inst.media_new(media_path)
            player.set_media(media)
            player.play()

    def _listen_serial(self):
        try:
            while True:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                m = re.match(r'BUTTON_PRESSED_(\d+)', line)
                if m:
                    idx = int(m.group(1)) - 1
                    self.force_pause()
                    self._play_team_sound(idx)
        except Exception as e:
            print(f"Erreur série: {e}")

    def _load_media(self, path):
        media = self.instance.media_new(path)
        self.player.set_media(media)

    def _load_track(self):
        self._load_media(self.track_list[self.index])
        self.duration = 1
        self.playing = False
        self.paused_at = 0

    def _build_ui(self):
        self.title("Lecteur Audio MP4")
        self.geometry("600x600")

        # Contrôles de lecture
        ctrl = tk.Frame(self)
        ctrl.pack(pady=5)
        tk.Button(ctrl, text="←", command=self.prev_track).grid(row=0, column=0, padx=5)
        self.play_btn = tk.Button(ctrl, text="Play", command=self.toggle_play)
        self.play_btn.grid(row=0, column=1, padx=5)
        tk.Button(ctrl, text="→", command=self.next_track).grid(row=0, column=2, padx=5)

        self.scale = ttk.Scale(self, from_=0, to=100, orient="horizontal")
        self.scale.pack(fill="x", padx=10)
        self.scale.bind("<ButtonRelease-1>", self.on_seek)

        self.time_label = tk.Label(self, text="00:00 / 00:00")
        self.time_label.pack(pady=5)

        vol_frame = tk.Frame(self)
        vol_frame.pack(pady=5)
        tk.Label(vol_frame, text="Volume").grid(row=0, column=0, padx=5)
        self.vol_scale = ttk.Scale(vol_frame, from_=0, to=100, orient="horizontal", command=self.on_volume_change)
        self.vol_scale.set(50)
        self.vol_scale.grid(row=0, column=1)

        # Affichage de la hiérarchie
        self.tree_frame = tk.Frame(self)
        self.tree_frame.pack(fill="x", padx=10, pady=5)
        self._update_path_display()

        # Section scores et sons
        self.score_frame = tk.LabelFrame(self, text="Équipes & Sons")
        self.score_frame.pack(fill="x", padx=10, pady=10)
        self._build_score_ui()

    def _update_path_display(self):
        for w in self.tree_frame.winfo_children(): w.destroy()
        full = self.track_list[self.index]
        rel = os.path.relpath(full, self.root_path)
        parts = rel.split(os.sep)
        for i, part in enumerate(parts):
            clean = re.sub(r'^\d+', '', part).replace('-', ' ').strip()
            color = COLORS[i % len(COLORS)]
            tk.Label(self.tree_frame, text=clean, fg=color).pack(anchor='w')

    def _build_score_ui(self):
        for w in self.score_frame.winfo_children(): w.destroy()
        for i, t in enumerate(self.teams):
            row = tk.Frame(self.score_frame)
            row.pack(fill='x', pady=2)
            tk.Label(row, text=t['name'], width=15, anchor='w').pack(side='left')
            minus = tk.Button(row, text='-', command=lambda i=i: self._change_score(i, -1))
            minus.pack(side='left')
            lbl = tk.Label(row, text=str(t['score']), width=3)
            lbl.pack(side='left')
            plus = tk.Button(row, text='+', command=lambda i=i: self._change_score(i, +1))
            plus.pack(side='left')
            # combobox pour son
            cb = ttk.Combobox(row, values=self.sounds, width=15)
            cb.set(t['sound'] or '')
            cb.pack(side='right', padx=5)
            cb.bind('<<ComboboxSelected>>', lambda e, i=i: self._select_sound(i, e.widget.get()))
            t['label'] = lbl
            t['cb'] = cb

    def _select_sound(self, idx, sound_name):
        self.teams[idx]['sound'] = sound_name
        # reload sound player for this index
        path = os.path.join(os.path.dirname(__file__), 'sounds', sound_name)
        inst = vlc.Instance()
        pl = inst.media_player_new()
        pl.set_media(inst.media_new(path))
        self.sound_players[idx] = pl

    def _change_score(self, idx, delta):
        self.teams[idx]['score'] += delta
        self.teams[idx]['label'].config(text=str(self.teams[idx]['score']))

    def toggle_play(self):
        if self.playing:
            self.player.pause()
            self.paused_at = time.time() - self.start_time
            self.play_btn.config(text="Play")
        else:
            self.player.play()
            time.sleep(0.1)
            self.duration = self.player.get_length() or 1
            self.start_time = time.time() - getattr(self, 'paused_at', 0)
            self.play_btn.config(text="Pause")
        self.playing = not self.playing
    
    def force_pause(self):
        if self.playing:
            self.player.pause()
            self.paused_at = time.time() - self.start_time
            self.play_btn.config(text="Play")
            self.playing = False

    def on_seek(self, event):
        val = self.scale.get()
        new_ms = val/100*self.duration
        self.player.set_time(int(new_ms))
        if self.playing:
            self.start_time = time.time() - new_ms/1000
        else:
            self.paused_at = new_ms/1000
        self.time_label.config(text=f"{format_time(new_ms)} / {format_time(self.duration)}")

    def on_volume_change(self, val):
        self.player.audio_set_volume(int(float(val)))

    def _auto_update(self):
        while True:
            if self.playing and self.duration>0:
                elapsed = (time.time()-self.start_time)*1000
                pct = min(elapsed/self.duration*100,100)
                self.scale.set(pct)
                self.time_label.config(text=f"{format_time(elapsed)} / {format_time(self.duration)}")
            time.sleep(0.5)

    def prev_track(self):
        self.player.stop()
        self.index = (self.index-1)%len(self.track_list)
        self._load_track(); self._update_path_display(); self.scale.set(0); self.time_label.config(text="00:00 / 00:00")

    def next_track(self):
        self.player.stop()
        self.index = (self.index+1)%len(self.track_list)
        self._load_track(); self._update_path_display(); self.scale.set(0); self.time_label.config(text="00:00 / 00:00")

    def _quit_all(self):
        self.destroy(); self.master.destroy(); sys.exit(0)

# Fenêtre d'accueil
class IntroWindow(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Blind Test - Accueil")
        self.geometry("500x350")
        self.protocol("WM_DELETE_WINDOW", self.quit_program)

        # Chemin du dossier
        tk.Label(self, text="Chemin du dossier BLIND-TEST:").pack(pady=5)
        frame = tk.Frame(self)
        frame.pack()
        self.entry = tk.Entry(frame, width=40)
        self.entry.pack(side='left', padx=5)
        default_dir = os.path.dirname(os.path.abspath(__file__))
        self.entry.insert(0, default_dir)
        tk.Button(frame, text="Parcourir", command=self.browse).pack(side='left')

        # Sélection du port série
        port_frame = tk.Frame(self)
        port_frame.pack(pady=5)
        tk.Label(port_frame, text="Port série:").pack(side='left')
        self.port_var = tk.StringVar()
        self.port_combo = ttk.Combobox(port_frame, textvariable=self.port_var, width=30, state='readonly')
        self.port_combo['values'] = [p.device for p in serial.tools.list_ports.comports()]
        self.port_combo.pack(side='left', padx=5)
        tk.Button(port_frame, text="Rafraîchir", command=self.refresh_ports).pack(side='left')

        # Section équipes dynamiques
        team_frame = tk.LabelFrame(self, text="Équipes & Sons")
        team_frame.pack(pady=10, fill='x', padx=10)
        self.team_frame = team_frame
        self.team_entries = []
        self.team_sounds = list_sounds()
        self.play_sounds = []
        self._load_sounds()
        btn_frame = tk.Frame(team_frame)
        btn_frame.pack(fill='x')
        tk.Button(btn_frame, text="+ Ajouter équipe", command=self.add_team).pack(side='left', padx=5)
        tk.Button(btn_frame, text="- Supprimer équipe", command=self.del_team).pack(side='left')
        for i in range(2): self.add_team()

        tk.Button(self, text="Jouer", command=self.start_game).pack(pady=10)
        self.thread = threading.Thread(target=self._listen_serial, daemon=True)
        self.on = True
        self.thread.start()

    def refresh_ports(self):
        ports = [p.device for p in serial.tools.list_ports.comports()]
        self.port_combo['values'] = ports
        if ports:
            self.port_combo.current(0)

    def browse(self):
        initial = os.path.dirname(os.path.abspath(__file__))
        path = filedialog.askdirectory(initialdir=initial)
        if path:
            self.entry.delete(0, tk.END)
            self.entry.insert(0, path)

    def add_team(self):
        row = tk.Frame(self.team_frame)
        row.pack(fill='x', pady=2)
        e = tk.Entry(row, width=15)
        e.insert(0, f"équipe {len(self.team_entries)+1}")
        e.pack(side='left', padx=5)
        cb = ttk.Combobox(row, values=self.team_sounds, width=15)
        if self.team_sounds:
            cb.current(0)
        cb.pack(side='left', padx=5)
        b = ttk.Button(row, text="play", command=lambda i=len(self.team_entries): self._play_team_sound(i))
        b.pack(side='left', padx=5)
        self.team_entries.append((e, cb))

    def del_team(self):
        if self.team_entries:
            e, cb = self.team_entries.pop()
            e.master.destroy()
            
    def _load_sounds(self):
        # create VLC players for each team sound
        for snd in self.team_sounds:
            path = os.path.join(os.path.dirname(__file__), 'sounds', snd)
            inst = vlc.Instance()
            pl = inst.media_player_new()
            media = inst.media_new(path)
            pl.set_media(media)
            self.play_sounds.append((snd, pl))

    def _play_team_sound(self, idx):
        sounds = [cb.get() for _, cb in self.team_entries]
        selected_sound = sounds[idx]
        for name, player in self.play_sounds:
            if name == selected_sound:
                # Réassigner le média pour forcer la lecture à redémarrer
                media_path = os.path.join(os.path.dirname(__file__), 'sounds', name)
                inst = vlc.Instance()
                media = inst.media_new(media_path)
                player.set_media(media)
                player.play()
    
    def _listen_serial(self):
        try:
            while self.on:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                m = re.match(r'BUTTON_PRESSED_(\d+)', line)
                if m:
                    idx = int(m.group(1)) - 1
                    self._play_team_sound(idx)
        except Exception as e:
            print(f"Erreur série: {e}")

    def start_game(self):
        path = self.entry.get()
        if not os.path.isdir(path):
            messagebox.showerror("Erreur", "Le chemin n'est pas valide.")
            return
        tracks = list_mp4_bfs(path)
        if not tracks:
            messagebox.showerror("Erreur", "Aucun fichier mp4 trouvé.")
            return
        teams = [e.get().strip() for e, _ in self.team_entries]
        sounds = [cb.get() for _, cb in self.team_entries]
        port = self.port_var.get() or None
        self.withdraw()
        self.on = False
        AudioPlayer(self, tracks, path, teams, sounds, serial_port=port)

    def quit_program(self):
        self.destroy(); sys.exit(0)

if __name__ == '__main__':
    IntroWindow().mainloop()
