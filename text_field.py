import pygame

class Object:

	def __init__(self, text, x, y):
		self.text = text
		self.x = x
		self.y = y
		font = pygame.font.SysFont('Calibri', 30)
		self.surface = font.render(text, 1, (0, 0, 0), (255, 255, 255))