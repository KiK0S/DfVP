import pygame
import math

class Object:              

	def __init__(self, x, y, a, name):
		self.x = x
		self.y = y
		self.side = a
		self.center = [a/2, a/2]
		self.pict = pygame.image.load(name).convert_alpha()
		self.surface = self.pict

	def rotate(self, alpha):
		self.surface = pygame.transform.rotate(self.pict, math.degrees(alpha))
