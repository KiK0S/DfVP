import math
import random
import pygame
import os
import game
import player 
import time
import bullet
import enemy
import tower        
import constants 
import socket
import sys
port = int(sys.argv[2])
adress = sys.argv[1]
sock = socket.socket()
sock.settimeout(None)
sock.connect((adress, port))
idx = int(sock.recv(1024).decode('ascii'))
g = game.Game(constants.W, constants.H)
tw = tower.Object(constants.W, constants.H, constants.PREFIX + '\\tower.png')
figures = []
enemies = []
bullets = []
end = 0	
score = 0
clock = pygame.time.Clock()
while 1:	
	req = ''
	if end == 1:
		req += str(idx) + ';' + str(pygame.KEYDOWN) + ';' + str(pygame.K_ESCAPE) + '\n'
	for event in pygame.event.get():
		q = str(idx) + ';' + str(event.type) + ';'
		if event.type == pygame.KEYDOWN or event.type == pygame.KEYUP:
			q += str(event.key)
		else:
			q += '0'
		q += '\n'
		req += q
	req += constants.STR_K
	sock.send(req.encode('ascii'))
	resp = sock.recv(1024).decode('ascii')
	resp = resp.split('\n')
	del figures[:]
	for s in resp:
		if s == constants.STR_K:
			break
		if s == constants.STR_END:
			print('Goodbye')
			pygame.quit()
			sys.exit(0)
		q = s.split(';')
		if q[0] == constants.STR_P:
			if len(q) < 5:
				print('wrong query:', q)
				print(resp)
			else:
				_new = player.Object(float(q[1]), float(q[2]), q[4], constants.PREFIX + '\\player')
				_new.rotate(float(q[3]))
				figures.append(_new)
		if q[0] == constants.STR_B:
			if len(q) < 5:
				print('wrong query:', q)
				print(resp)
			else:
				_new = bullet.Object(float(q[1]), float(q[2]), q[4], constants.PREFIX + '\\bullet', alpha=float(q[3]))
				bullets.append(_new)
		if q[0] == constants.STR_E:
			if len(q) < 4:
				print('wrong query:', q)
				print(resp)
			else:
				_new = enemy.Object(float(q[1]) + tw.x + tw.center[0], float(q[2]) + tw.y + tw.center[1], tw, q[3], constants.PREFIX + '\\enemy')
				enemies.append(_new) 		
	iter = 0
	while iter < len(enemies):
		ok = True
		enemies[iter].x += enemies[iter].dx * enemies[iter].speed
		enemies[iter].y += enemies[iter].dy * enemies[iter].speed
		iter_1 = 0
		while iter_1 < len(bullets):
			b = bullets[iter_1]
			if math.hypot(b.x + b.center[0] - enemies[iter].x - enemies[iter].center[0], b.y + b.center[1] - enemies[iter].y - enemies[iter].center[1]) < b.size + enemies[iter].size and (str(b.idx) == str(enemies[iter].idx) or enemies[iter].idx == ''):
				del enemies[iter]
				del bullets[iter_1]
				score += 1
				iter -= 1
				ok = False
				break
			iter_1 += 1
		iter += 1
	iter = 0
	for e in enemies:
		if math.hypot(e.x + e.center[0] - tw.x - tw.center[0], e.y + e.center[1] - tw.y - tw.center[1]) < e.size + tw.size - 10:
			del enemies[iter]
			end = 1
			break
		iter += 1
	if end:
		continue

	iter = 0
	while iter < len(bullets):
		if bullets[iter].x < 0 or bullets[iter].y < 0 or bullets[iter].x >= constants.W or bullets[iter].y >= constants.H:
			del bullets[iter]
			iter -= 1
		else:
			bullets[iter].x += bullets[iter].dx
			bullets[iter].y += bullets[iter].dy
		iter += 1
	g.surface.blit(g.background, (0, 0))
	for fig in figures:
		g.surface.blit(fig.surface, (fig.x, fig.y))
	for b in bullets:
		g.surface.blit(b.surface, (b.x, b.y))
	for e in enemies:
		g.surface.blit(e.surface, (e.x, e.y))
	g.surface.blit(tw.surface, (tw.x, tw.y))
	pygame.display.set_caption('Score: ' + str(score))
	pygame.display.flip()
	clock.tick(constants.FPS)
