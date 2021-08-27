# Feedbacks de Hubert

## UI/CSS/i18n

* ajouter story par défaut avec des données

* loading
  * remplacer le titre loading par Grafana 
  * enlever " Currently loading Grafana related data "
* error
  * aligner le cc-error à gauche
* bouton enable => enable grafana
* bouton rest => reset all dashboards
* bouton disable => disable grafana
* i18n français
* penser à mettre des points à la fin de phrases
* reseting => resetting
* {Link[]} links
  * {String} link
* doc: acount => account
* doc: A component to display enable/disable a grafana service.
  * A component to display information about grafana and allow some actions: enable, disable, reset.

## code

* ne pas oublier de bouger les images sur un Cellar
* doc:
  * @prop {false|"reseting"|"loading"|"disabling"|"enabling"|link-doc|link-grafana} error - Displays an error message.
  * @prop {false|"reseting"|"loading"|"disabling"|"enabling"|"link-doc"|"link-grafana"} error - Displays an error message.
* jsdoc: start desc with upper case
* on fait pas de style en ligne
  * <div slot="title" style="font-weight: bold;">${i18n('cc-grafana-info.main-title')}</div>
  * remplacer par class="foo" + style
  * dans le cas présent je pense que c'est déjà gras

## code story

* "RAS"
