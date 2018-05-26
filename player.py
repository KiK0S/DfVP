import pygame
import math

class Object:              

	def __init__(self, x, y, name='', a=50):
		self.x = x
		self.y = y
		self.size = a
		self.center = [a // 2, a // 2]
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

	def rotate(self, alpha):
		self.surface = pygame.transform.rotate(self.pict, math.degrees(alpha))
