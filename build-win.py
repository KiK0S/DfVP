from cx_Freeze import setup, Executable

ex = [Executable('main.py', targetName = 'game.exe'), Executable('start.py', targetName = 'server.exe')]

options = {
	'build_exe': {
		'includes': ['pygame', 'sys', 'socket', 'math', 'random', 'os', 'time'],
		'include_files': ['assets']			
	}
}

setup(name = 'KEK',
	  version = '1.0',           
	  author = 'KiK0S',
	  options = options,
	  executables = ex)