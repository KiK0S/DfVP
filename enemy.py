import pygame
import math

class Object:
	
	def __init__(self, x, y, a):         
		self.surface = pygame.Surface((a, a))
		self.surface.fill((255, 255, 255))
		pygame.draw.circle(self.surface, (0, 255, 0), (a // 2, a // 2), a // 2)
		self.x = x
		self.y = y
		self.center = [x + a // 2, y + a // 2]
		self.size = a // 2