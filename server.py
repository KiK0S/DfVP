import socket
sock = socket.socket()
sock.bind(('', 9090))
sock.listen(1)
conn, addr = sock.accept()

print ('connected:', addr)

while True:
    data = conn.recv(1024)
    data = data.decode('ascii')
    if not data:
        break
    conn.send(data.encode('ascii'))

conn.close()