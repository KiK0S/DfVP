import pygame
import math

class Object:
	
	def __init__(self, x, y, a, tw):         
		self.surface = pygame.Surface((a, a), pygame.SRCALPHA, 32)
		self.surface = self.surface.convert_alpha()
		pygame.draw.circle(self.surface, (0, 255, 0), (a // 2, a // 2), a // 2)
		self.x = x               
		self.y = y
		self.center = [a // 2, a // 2]
		self.size = a // 2
		self.speed = 2
		self.dx = self.speed * (tw.x + tw.center[0] - self.x - self.center[0]) / math.hypot(self.x + self.center[0] - tw.x - tw.center[0], self.y + self.center[1] - tw.y - tw.center[1])
		self.dy = self.speed * (tw.y + tw.center[1] - self.y - self.center[1]) / math.hypot(self.x + self.center[0] - tw.x - tw.center[0], self.y + self.center[1] - tw.y - tw.center[1])