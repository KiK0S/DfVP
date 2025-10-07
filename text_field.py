import pygame

class Object:

	def __init__(self, text, x, y, flag=0):
		self.text = text
		self.x = x
		self.y = y
		self.font = pygame.font.SysFont('Calibri', 30)
		self.surface = self.font.render(self.text, 1, (255, 255, 255))
		if flag:
			self.x -= self.surface.get_width() // 2
			self.y -= self.surface.get_height() // 2

	def check(self, coord):
		x, y = coord
		if x >= self.x and x <= self.x + self.surface.get_width() and y >= self.y and y <= self.y + self.surface.get_height():
			return 1
		return 0

	def settext(self, text):
		self.text = text
		self.surface = self.font.render(self.text, 1, (255, 255, 255))