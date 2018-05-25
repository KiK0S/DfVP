import pygame
import game
class Object:
	def __init__(self, w, h, name, a = 100):
		self.x = w // 2 - a // 2
		self.y = h // 2 - a // 2
		self.size = a // 2
		self.center = [a // 2, a // 2]
		if name != '':
			self.pict = pygame.image.load(name).convert_alpha()
			self.surface = self.pict

