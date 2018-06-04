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
import text_field

class Object:
	def __init__(self,
				 #caption, 
				 width,
				 height):
		self.width = width
		self.height = height
		self.finish = False
		pygame.init()
		pygame.font.init()
		self.surface = pygame.display.set_mode((width, height))
		pygame.display.set_icon(pygame.image.load(constants.PREFIX + constants.SLASH  + 'icon.png').convert_alpha())
		self.background = pygame.image.load(constants.PREFIX + constants.SLASH + 'pole.png').convert_alpha()

	def run(self, idx, sock):
		tw = tower.Object(constants.W, constants.H, constants.PREFIX + constants.SLASH + 'tower.png')
		figures = []
		enemies = []
		bullets = []
		end = 0	
		score = 0
		clock = pygame.time.Clock()
		pygame.display.set_caption('DfVP')           
		score_view = text_field.Object('kek', 0, 0)
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
					_new = player.Object(float(q[1]), float(q[2]), q[4], constants.PREFIX + constants.SLASH + 'player')
					_new.rotate(float(q[3]))
					figures.append(_new)
				if q[0] == constants.STR_B:
					_new = bullet.Object(float(q[1]), float(q[2]), q[4], constants.PREFIX + + constants.SLASH + 'bullet', alpha=float(q[3]))
					bullets.append(_new)
				if q[0] == constants.STR_E:
					_new = enemy.Object(float(q[1]) + tw.x + tw.center[0], float(q[2]) + tw.y + tw.center[1], tw, q[3], constants.PREFIX + constants.SLASH + 'enemy')
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
	    	
			self.surface.blit(self.background, (0, 0))
	
			for fig in figures:
				self.surface.blit(fig.surface, (fig.x, fig.y))
			for b in bullets:
				self.surface.blit(b.surface, (b.x, b.y))
			for e in enemies:
				self.surface.blit(e.surface, (e.x, e.y))

			self.surface.blit(tw.surface, (tw.x, tw.y))
			del score_view
			score_view = text_field.Object('Score: ' + str(score), 0, 0)
			self.surface.blit(score_view.surface, (score_view.x, score_view.y))
			txt = text_field.Object('    Num of players: ' + str(len(figures)), score_view.surface.get_width(), 0)
			self.surface.blit(txt.surface, (txt.x, txt.y))
			pygame.display.flip()
			clock.tick(constants.FPS)
