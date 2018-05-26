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
sock.connect((adress, port))
g = game.Game(constants.W, constants.H)

while 1:	
	req = ''
	for event in pygame.event.get():
		q = str(port - 9090) + ';' + str(event.type) + ';'
		if event.type == pygame.KEYDOWN or event.type == pygame.KEYUP:
			q += str(event.key)
		else:
			q += '0'
		q += '\n'
		req += q
	req += 'kek'
	sock.send(req.encode('ascii'))
	
	figures = []
	enemies = []
	bullets = []
	tw = tower.Object(constants.W, constants.H, constants.PREFIX + '\\tower.png')
	resp = sock.recv(8192).decode('ascii')
	resp = resp.split('\n')
	for s in resp:
		if s == 'kek':
			break
		q = s.split(';')
		if q[0] == 'player':
			if len(q) < 4:
				print('wrong query:', q)
				print(resp)
			else:
				_new = player.Object(float(q[1]), float(q[2]), constants.PREFIX + '\\player.png')
				_new.rotate(float(q[3]))
				figures.append(_new)
		if q[0] == 'tower':
			if len(q) < 3:
				print('wrong query:', q)
				print(resp)
			else:
				_new = tower.Object(float(q[1]), float(q[2]), constants.PREFIX + '\\tower.png')
				tw = _new
		if q[0] == 'bullet':
			if len(q) < 3:
				print('wrong query:', q)
				print(resp)
			else:
				_new = bullet.Object(float(q[1]), float(q[2]), constants.PREFIX + '\\bullet.png')
				bullets.append(_new)
		if q[0] == 'enemy':
			if len(q) < 3:
				print('wrong query:', q)
				print(resp)
			else:
				_new = enemy.Object(float(q[1]), float(q[2]), tw, constants.PREFIX + '\\enemy.png')
				enemies.append(_new) 		
	g.surface.fill((255, 255, 255))
	for fig in figures:
		g.surface.blit(fig.surface, (fig.x, fig.y))
	for b in bullets:
		g.surface.blit(b.surface, (b.x, b.y))
	for e in enemies:
		g.surface.blit(e.surface, (e.x, e.y))
	g.surface.blit(tw.surface, (tw.x, tw.y))
	pygame.display.flip()

	time.sleep(1 / constants.FPS)
