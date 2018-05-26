import pygame
import math
import constants
class Object:
	
	def __init__(self, x, y, name='', a = 10, alpha = 0):
		if name != '':
			self.surface = pygame.image.load(name).convert_alpha()
		self.x = x
		self.y = y
		self.size = a // 2
		self.alpha = alpha
		self.speed = constants.BULLET_SPEED
		self.center = [a//2, a//2]
		self.dx = self.speed * math.cos(alpha)
		self.dy = self.speed * math.sin(alpha)
				 
