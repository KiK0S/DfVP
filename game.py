import pygame
class Game:
	def __init__(self,
				 #caption, 
				 width,
				 height):
		self.width = width
		self.height = height
		self.finish = False
		pygame.init()
		self.surface = pygame.display.set_mode((width, height))
		self.background = pygame.Surface(self.surface.get_size())