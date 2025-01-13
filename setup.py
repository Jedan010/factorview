from setuptools import setup, find_packages

setup(
    name='factorview',
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'fastapi==0.95.2',
        'uvicorn[standard]==0.22.0',
        'python-dotenv==1.0.0'
    ],
    package_data={
        'factorview': [
            'static/css/*',
            'static/js/*',
            'templates/*'
        ]
    },
    entry_points={
        'console_scripts': [
            'factorview=factorview.app:main'
        ]
    },
    python_requires='>=3.8',
)
