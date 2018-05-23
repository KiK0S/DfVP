import pygame
class Object:
	def __init__(self, w, h):
		self.surface = pygame.Surface((w, h))
		self.surface.fill((255, 255, 255))
		pygame.draw.polygon(self.surface, (255, 0, 0), ((w, 0), (0, h), (-w, 0)))
		self.x = 100
		self.y = 100