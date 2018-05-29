import pygame
import math

class Object:              

	def __init__(self, x, y, name='', a=50):
		self.x = x
		self.y = y
		self.size = a
		self.center = [a // 2, a // 2]
		self.min_x = 0
		self.max_x = a
		self.min_y = 0
		self.max_y = a	
		self.points_x = [0, 0, a]
		self.points_y = [0, a, a//2]
		if name != '':
			self.pict = pygame.image.load(name).convert_alpha()
			self.surface = self.pict
		self.dx = 0
		self.dy = 0
		self.cur_dx = 0
		self.cur_dy = 0
		self.move_down = False
		self.move_up = False
		self.move_left = False
		self.move_right = False
		self.alpha = 0

	def checkout(self):
		x = self.points_x
		y = self.points_y
		for i in range(len(x)):
			_x = x[i]
			_y = y[i]
			x[i] = _x * math.cos(self.alpha) - _y * math.sin(self.alpha)
			y[i] = _y * math.cos(self.alpha) + _x * math.sin(self.alpha)
		self.min_x = min(x)
		self.max_x = max(x)
		self.min_y = min(y)
		self.max_y = max(y)

	def rotate(self, alpha):
		self.surface = pygame.transform.rotate(self.pict, math.degrees(alpha))
