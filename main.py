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

port = 9090
sock = socket.socket()
sock.connect(('localhost', port))
g = game.Game(constants.W, constants.H)

while 1:	
	req = ''
	print('making query')
	for event in pygame.event.get():
		q = str(port - 9090) + ';' + str(event.type) + ';'
		if event.type == pygame.KEYDOWN or event.type == pygame.KEYUP:
			q += str(event.key)
		else:
			q += '0'
		q += '\n'
		req += q
	sock.send(req.encode('ascii'))
	
	figures = []
	enemies = []
	bullets = []
	tw = tower.Object(constants.W / 2, constants.H / 2, 'C:\\Users\\KiKoS\\Desktop\\DfVP\\tower.png')
	print('getting query')
	resp = sock.recv(1024).decode('ascii')
	print('got query')
	if not resp == '':
		resp = resp.split('\n')
		print('process query')
		for s in resp:
			#print(s)
			q = s.split(';')
			if q[0] == 'player':
				_new = player.Object(float(q[1]), float(q[2]), 'C:\\Users\\KiKoS\\Desktop\\DfVP\\player.png')
				_new.rotate(float(q[3]))
				figures.append(_new)
			if q[0] == 'tower':
				_new = tower.Object(float(q[1]), float(q[2]), 'C:\\Users\\KiKoS\\Desktop\\DfVP\\tower.png')
				tw = _new
			if q[0] == 'bullet':
				_new = bullet.Object(float(q[1]), float(q[2]), tw, 'C:\\Users\\KiKoS\\Desktop\\DfVP\\bullet.png')
				bullets.append(_new)
			if q[0] == 'enemy':
				_new = enemy.Ogject(float(q[1]), float(q[2]), 'C:\\Users\\KiKoS\\Desktop\\DfVP\\enemy.png')
				enemies.append(_new) 		
	print('draw')
	g.surface.fill((255, 255, 255))
	for fig in figures:
		g.surface.blit(fig.surface, (fig.x, fig.y))
	for b in bullets:
		g.surface.blit(b.surface, (b.x, b.y))
	for e in enemies:
		g.surface.blit(e.surface, (e.x, e.y))
	g.surface.blit(tw.surface, (tw.x, tw.y))
	#pygame.display.set_caption('Score: ' + str(score))	
	pygame.display.flip()

	time.sleep(1 / constants.FPS)
