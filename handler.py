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
		self.tw = tower.Object(constants.W, constants.H) 	
		self.current_rate = 0
		self.score = 0

	def handle(self, a, b, c):
		a = int(a)
		b = int(b)
		c = int(c)
		if a < 0 or a >= len(self.figures):
			self.figures.append(player.Object(0, 0, '')) 
		if b == pygame.KEYDOWN:
			if c == pygame.K_ESCAPE:
				print('Goodbye')
				pygame.quit()
				exit()
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
			_new = enemy.Object(dist_x, minus * math.sqrt(dist * dist - dist_x * dist_x), self.tw)
			self.enemies.append(_new) 
		
		for fig in self.figures:
			if fig.move_left:
				if fig.dx > -5:
					fig.dx -= 0.5                    
			else: 
				if fig.dx < 0:
					fig.dx += 0.75 
	
			if fig.move_right:
				if fig.dx < 5:
					fig.dx += 0.5
			else:
				if fig.dx > 0:
					fig.dx -= 0.75

			if fig.move_up:
				if fig.dy > -5:
					fig.dy -= 0.5
			else:
				if fig.dy < 0:
			   		fig.dy += 0.75

			if fig.move_down:
				if fig.dy < 5:
					fig.dy += 0.5
			else:
   				if fig.dy > 0:
   					fig.dy -= 0.75
			fig.cur_dx, fig.cur_dy = 0, 0
			if abs(fig.dy) <= 1:
				fig.cur_dy = 0
			else:
				fig.cur_dy = fig.dy
			if abs(fig.dx) <= 1:
				fig.cur_dx = 0
			else:
				fig.cur_dx = fig.dx

			if fig.cur_dx == 0 and fig.cur_dy == 0:
				pass
			else:
				fig.alpha = math.atan2(-fig.cur_dy, fig.cur_dx)

			fig.x += fig.cur_dx
			fig.y += fig.cur_dy
		
		iter = 0
		while iter < len(self.enemies):
			ok = True
			self.enemies[iter].x += self.enemies[iter].dx
			self.enemies[iter].y += self.enemies[iter].dy
			iter_1 = 0
			while iter_1 < len(self.bullets):
				b = self.bullets[iter_1]
				if math.hypot(b.x + b.center[0] - self.enemies[iter].x - self.enemies[iter].center[0], b.y + b.center[1] - self.enemies[iter].y - self.enemies[iter].center[1]) < b.size + self.enemies[iter].size:
					del self.enemies[iter]
					del self.bullets[iter_1]
					iter -= 1
					ok = False
					self.score += 1
					break
				iter_1 += 1
			iter += 1
		iter = 0
		for e in self.enemies:
			if math.hypot(e.x + e.center[0] - self.tw.x - self.tw.center[0], e.y + e.center[1] - self.tw.y - self.tw.center[1]) < e.size + self.tw.size - 10:
				del self.enemies[iter]
				time.sleep(1)
				print('Game Over')
				exit()
				break
			iter += 1

		iter = 0
		while iter < len(self.bullets):
			if self.bullets[iter].x < 0 or self.bullets[iter].y < 0 or self.bullets[iter].x >= constants.W or self.bullets[iter].y >= constants.H:
				del self.bullets[iter]
				iter -= 1
			else:
				self.bullets[iter].x += self.bullets[iter].dx
				self.bullets[iter].y += self.bullets[iter].dy
			iter += 1

	def get(self):
		ans = ''
		for fig in self.figures:
			ans += constants.STR_P + ';' + str(int(fig.x)) + ';' + str(int(fig.y)) + ';' + str(float(int(fig.alpha * 1000) / 1000)) + '\n'
		for b in self.bullets:
			ans += constants.STR_B + ';' +  str(int(b.x)) + ';' + str(int(b.y)) + '\n'
		for e in self.enemies:
			ans += constants.STR_E + ';' + str(int(e.x)) + ';' + str(int(e.y)) + '\n';
		ans += constants.STR_T + ';' + str(int(self.tw.w)) + ';' + str(int(self.tw.h)) + '\n'
		ans += constants.STR_S + ';' + str(int(self.score)) + '\n'
		return ans