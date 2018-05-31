import pygame
import os
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
		self.background = pygame.image.load(os.getcwd() + '\\assets\\pole.png').convert_alpha()