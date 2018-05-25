import pygame
import math

class Object:
	
	def __init__(self, x, y, a, tw):         
		self.surface = pygame.Surface((a, a), pygame.SRCALPHA, 32)
		self.surface = self.surface.convert_alpha()
		pygame.draw.circle(self.surface, (0, 255, 0), (a // 2, a // 2), a // 2)
		self.x = x
		self.y = y
		self.center = [x + a // 2, y + a // 2]
		self.size = a // 2
		self.dx = 3 * (tw.center[0] - self.center[0]) / math.hypot(self.center[0] - tw.center[0], self.center[1] - tw.center[1])
		self.dy = 3 * (tw.center[1] - self.center[1]) / math.hypot(self.center[0] - tw.center[0], self.center[1] - tw.center[1])