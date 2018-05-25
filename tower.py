import pygame
import game
class Object:
	def __init__(self, g, a = 100):
		self.size = a // 2
		self.center = [g.width // 2, g.height // 2]
		self.x = g.width // 2 - self.size
		self.y = g.height // 2 - self.size
		self.surface = pygame.Surface((a, a), pygame.SRCALPHA, 32)
		self.surface = self.surface.convert_alpha()		
		pygame.draw.circle(self.surface, (0, 100, 150), (self.size, self.size), self.size)
