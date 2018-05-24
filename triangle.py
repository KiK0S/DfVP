import pygame
import math

class Object:              
	
	def rotate(self, alpha):
		pass

	def __init__(self, a):
		self.surface = pygame.Surface((a, a))
		self.surface.fill((255, 255, 255))
		self.x = 100
		self.y = 100
		self.side = a
		self.center = [a/2, a/2]
		self.vectors = [
			(-a/4, 0), (0, a/2), (a /4, 0)
		]
		dots = []
		for dot in self.vectors:
			_new = [0, 0]
			_new[0] = self.center[0] + dot[0]
			_new[1] = self.center[1] + dot[1]
			dots.append(_new)	
		pygame.draw.polygon(self.surface, (255, 0, 0), dots)
		
	def rotate(self, alpha):
		self.surface.fill((255, 255, 255))
		s = math.sin(alpha)
		c = math.cos(alpha)
		newdots = []
		for dot in self.vectors:
			_new = [0, 0]
			_new[0] = dot[0] * c - dot[1] * s
			_new[1] = dot[0] * s + dot[1] * c
			d = math.hypot(_new[0], _new[1])
			_new[0] /= d
			_new[1] /= d
			d = math.hypot(dot[0], dot[1])
			_new[0] *= d
			_new[1] *= d
			_new[0] += self.center[0]
			_new[1] += self.center[1]
			newdots.append(_new)	
		pygame.draw.polygon(self.surface, (255, 0, 0), newdots)
		
		

