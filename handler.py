import pygame
import player
import bullet
import enemy
import tower
import math
import random
import constants
import time

class Object:
	
	def __init__(self):
		self.figures = []
		self.bullets = []
		self.enemies = []
		self.current_rate = 0
		self.end = 0

	def handle(self, a, b, c):
		a = int(a)
		b = int(b)
		c = int(c)
		if a < 0 or a >= len(self.figures):
			self.figures.append(player.Object(0, 0, '')) 
		if b == pygame.KEYDOWN:
			if c == pygame.K_ESCAPE:
				self.end = 1
			if c == pygame.K_l:
				if self.figures[a].cur_dx == 0 and self.figures[a].cur_dy == 0:
					pass
				else:
					_new = bullet.Object(self.figures[a].x + self.figures[a].center[0], self.figures[a].y + self.figures[a].center[1],
					 alpha=math.atan2(self.figures[a].cur_dy, self.figures[a].cur_dx))
					self.bullets.append(_new)
			if c == pygame.K_s:
				self.figures[a].move_down = True
			if c == pygame.K_w:
				self.figures[a].move_up = True
			if c == pygame.K_a:
				self.figures[a].move_left = True
			if c == pygame.K_d:
				self.figures[a].move_right = True
			  
				                    
		if b == pygame.KEYUP:
			if c == pygame.K_s:
				self.figures[a].move_down = False
			if c == pygame.K_w:
				self.figures[a].move_up = False
			if c == pygame.K_a:
				self.figures[a].move_left = False
			if c == pygame.K_d:
				self.figures[a].move_right = False
	
	def update(self):
		self.current_rate += 1
		if self.current_rate % constants.FPS == 0:
			dist = constants.W * 2
			dist_x = random.randint(-dist, dist)
			minus = 1
			if random.randint(0, 1) == 1:
				minus = -1
			self.enemies.append([dist_x, minus * math.sqrt(dist * dist - dist_x * dist_x)]) 
		
		for fig in self.figures:
			if fig.move_left:
				if fig.dx > -constants.MAX_P_SPEED:
					fig.dx -= constants.RISE_P_SPEED                    
			else: 
				if fig.dx < 0:
					fig.dx += constants.FALL_P_SPEED 
	
			if fig.move_right:
				if fig.dx < constants.MAX_P_SPEED:
					fig.dx += constants.RISE_P_SPEED
			else:
				if fig.dx > 0:
					fig.dx -= constants.FALL_P_SPEED

			if fig.move_up:
				if fig.dy > -constants.MAX_P_SPEED:
					fig.dy -= constants.RISE_P_SPEED
			else:
				if fig.dy < 0:
			   		fig.dy += constants.FALL_P_SPEED

			if fig.move_down:
				if fig.dy < constants.MAX_P_SPEED:
					fig.dy += constants.RISE_P_SPEED
			else:
   				if fig.dy > 0:
   					fig.dy -= constants.FALL_P_SPEED
			fig.cur_dx, fig.cur_dy = 0, 0
			if abs(fig.dy) <= 1:
				fig.cur_dy = 0
			else:
				fig.cur_dy = fig.dy
			if abs(fig.dx) <= constants.P_BAREER:
				fig.cur_dx = 0
			else:
				fig.cur_dx = fig.dx

			if fig.cur_dx == 0 and fig.cur_dy == 0:
				pass
			else:
				fig.alpha = math.atan2(-fig.cur_dy, fig.cur_dx)
			fig.checkout()
			fig.x += fig.cur_dx
			fig.y += fig.cur_dy
			fig.x = max(fig.x, 0)
			fig.x = min(fig.x, constants.W - fig.size)
			fig.y = max(fig.y, 0)
			fig.y = min(fig.y, constants.H - fig.size)

	def get(self):
		ans = ''
		for fig in self.figures:
			ans += constants.STR_P + ';' + str(int(fig.x)) + ';' + str(int(fig.y)) + ';' + str(float(int(fig.alpha * 1000) / 1000)) + '\n'
		for b in self.bullets:
			ans += constants.STR_B + ';' +  str(int(b.x)) + ';' + str(int(b.y)) + ';' + str(float(int(b.alpha * 1000) / 1000)) + '\n'
		for e in self.enemies:
			ans += constants.STR_E + ';' + str(int(e[0])) + ';' + str(int(e[1])) + '\n'
		if self.end == 1:
			ans += constants.STR_END + '\n'
			self.end = 2
		return ans

	def clear(self):
		del self.enemies[:]
		del self.bullets[:]