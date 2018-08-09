import os
import sys
import platform
W = 600
H = 600
start_FPS = 30
FPS = 30
ENEMY_SPEED = 1.5 * start_FPS / FPS 
BULLET_SPEED = 15 *  start_FPS / FPS
MAX_P_SPEED = 5 * start_FPS / FPS
FALL_P_SPEED = 0.5 * start_FPS / FPS
RISE_P_SPEED = 0.75 * start_FPS / FPS
P_BAREER = 1 * start_FPS / FPS
if platform.system() == 'Windows':
	SLASH = '\\'
else:
	SLASH = '/'
ADDRESS = 'paramonod.ddns.net'
PREFIX = os.path.dirname(os.path.realpath(sys.argv[0])) + SLASH + 'assets'
STR_C = 'c'
STR_S = 's'
STR_T = 't'
STR_B = 'b'
STR_P = 'p'
STR_K = 'k'
STR_E = 'e'
STR_END = 'end'
STR_CHECK = 'check'
WAVES = 3
NUM_PER_WAVE = 4
COLOR_PER_WAVE = 1
WAVE_TIME = 5
PORT = 9090
PNG = '.png'
MAXPLAYER = 3
START = 'start'
LEFT = 1
