import game
import pygame
import sys
import constants
import text_field
import socket
g = game.Object(constants.W, constants.H)
start_button = text_field.Object('START', constants.W // 2, constants.H // 2, flag=1)
sock = socket.socket()
sock.connect((constants.ADDRESS, constants.PORT))
idx = int(sock.recv(1024).decode('ascii'))
while 1: 
	end = 0
	start = 0	
	for event in pygame.event.get():
		if event.type == pygame.KEYDOWN:
			if event.key == pygame.K_ESCAPE:
				end = 1
		if event.type == pygame.MOUSEBUTTONDOWN:
			if event.button == constants.LEFT:
				coords = pygame.mouse.get_pos()
				if start_button.check(coords):
					sock.send(constants.START.encode('ascii'))
					start = 1			
	if end:
		break
	if start == 0:
		sock.send('check'.encode('ascii'))
	resp = sock.recv(1024).decode('ascii')
	if resp == constants.START:
		g.run(idx, sock)
	g.surface.blit(g.background, (0, 0))
	g.surface.blit(start_button.surface, (start_button.x, start_button.y))
	pygame.display.flip()
