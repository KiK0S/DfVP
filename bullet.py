import pygame
import math
class Object:
	
	def __init__(self, a, x, y, alpha):
		self.surface = pygame.Surface((a, a))
		self.surface.fill((255, 255, 255))
		self.x = x
		self.y = y
		self.size = a // 2
		self.speed = 15
		self.center = [x + a//2, y + a//2]
		self.dx = self.speed * math.cos(alpha)
		self.dy = self.speed * math.sin(alpha)
		pygame.draw.circle(self.surface, (0, 0, 255), (a // 2, a // 2), a // 2) 
				 