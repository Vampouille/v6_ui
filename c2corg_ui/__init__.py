from pyramid.config import Configurator
from pyramid_mako import add_mako_renderer


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    add_mako_renderer(config, '.html')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_static_view('node_modules', settings.get('node_modules_path'),
                           cache_max_age=3600)
    config.add_static_view('closure', settings.get('closure_library_path'),
                           cache_max_age=3600)

    config.add_route('index', '/')

    config.add_route('waypoints_index', '/waypoints')
    config.add_route('waypoints_view', '/waypoints/{id}/{culture}')

    config.add_route('routes_index', '/routes')
    config.add_route('routes_view', '/routes/{id}/{culture}')

    config.scan()
    return config.make_wsgi_app()
