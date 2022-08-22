import game
import pygame
import sys
import constants
import text_field
import socket
g = game.Object(constants.W, constants.H)
start_button = text_field.Object('START', constants.W // 2, constants.H // 2, flag=1)
cnt_text = text_field.Object('', 0, 0)
sock = socket.socket()
sock.settimeout(50)
sock.connect((constants.ADDRESS, constants.PORT))
idx = int(sock.recv(1024).decode('ascii'))
while 1: 
	try:
		end = 0
		start = 0	
		for event in pygame.event.get():
			if event.type == pygame.QUIT:
				end = 1
			elif event.type == pygame.KEYDOWN:
				if event.key == pygame.K_ESCAPE:
					end = 1
			elif event.type == pygame.MOUSEBUTTONDOWN:
				if event.button == constants.LEFT:
					coords = pygame.mouse.get_pos()
					if start_button.check(coords):
						sock.send(constants.START.encode('ascii'))
						start = 1			
		if end:
			sock.send(constants.STR_END.encode('ascii'))
			print('Goodbye')
			break
		if start == 0:
			sock.send('check'.encode('ascii'))
		resp = sock.recv(1024).decode('ascii')
		if resp == constants.START:
			g.run(idx, sock)
		else:
			a = resp.split(';')
			if len(a) > 1:
				cnt_text.settext('Connected: ' + a[1])
			else:
				print(a)
		g.surface.blit(g.background, (0, 0))
		g.surface.blit(start_button.surface, (start_button.x, start_button.y))
		g.surface.blit(cnt_text.surface, (cnt_text.x, cnt_text.y))
		pygame.display.flip()
	except BaseException as e:
		break
