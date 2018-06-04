import pygame

class Object:

	def __init__(self, text, x, y):
		self.text = text
		self.x = x
		self.y = y
		font = pygame.font.SysFont('Calibri', 30)
		self.surface = font.render(text, 1, (255, 255, 255))

	def check(self, coord):
		x, y = coord
		if x >= self.x and x <= self.x + self.surface.get_width() and y >= self.y and y <= self.y + self.surface.get_height():
			return 1
		return 0