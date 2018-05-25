import pygame
import game
class Object:
	def __init__(self, g, name, a = 100):
		self.x = g.width // 2 - a // 2
		self.y = g.height // 2 - a // 2
		self.size = a // 2
		self.center = [a // 2, a // 2]
		self.pict = pygame.image.load(name).convert_alpha()
		self.surface = self.pict

