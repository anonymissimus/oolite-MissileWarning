"use strict";

this.name	= "missile_warning";
this.author	= "Anonymissimus";
this.copyright	= "2015 Anonymissimus";
this.description= "Repeatedly play a unique warning sound for as long as there is at least one incoming missile.";
this.version	= "0.1";
this.licence	= "CC BY-NC-SA 4.0";


this.$timer = null
this.$missile = null
this.$missile_inbound = null

this.startUp = function()
{
	$missile_inbound = new SoundSource;
	$missile_inbound.sound = "[missile_inbound]"
}

this.alertConditionChanged = function(newCondition, oldCondition)
{
	this._stop("alert condition changed from " + oldCondition + " to " + newCondition)
	if(newCondition < 2)
		return
	this._start("alert condition changed from " + oldCondition + " to " + newCondition)
}

this.shipWillDockWithStation = this.shipWillEnterWitchspace = this.shipDied = function()
{
	this._stop("player docks with station, exits system or has died")
}

this.shipKilledOther = function(whom)
{
	if(_isIncomingMissile(whom))
	{
		_stop("incoming missile " + whom + " was killed")
		_start("checking for further incoming missiles")
	}
}

this._stop = function(reason)
{
	if(!this.$timer)
	{
		//log(this.name, "stopping checking for missiles since " + reason + "; timer was not running")
		return
	}
	//log(this.name, "stopping checking for missiles since " + reason)
	if(this.$timer.isRunning)
		this.$timer.stop()
	if($missile_inbound.isPlaying)
		$missile_inbound.stop()
	delete this.$timer
}

this._start = function(reason)
{
	//log(this.name, "starting checking for missiles since " + reason)
	if(this.$timer)
		log(this.name, "starting checking while timer already running - this is a bug, please report")
	this.$timer = new Timer(this, this._checkAndPlay, 0, 1.5)
}

this.shipAttackedWithMissile = function(missile, whom)
{
	this._stop("player is attacked with " + missile + " by " + whom)
	this.$missile = missile
	this._start("player is attacked with " + missile + " by " + whom)
}

this._isIncomingMissile = function(entity)
{
	if(!entity.isShip)
		return false
	if(!entity.target || !entity.target.isPlayer)
		return false
	if(entity.isMissile || entity.scanClass == "CLASS_MISSILE")
		return true
	return entity.maxSpeed >= 750
}

this._checkAndPlay = function()
{
	var missile = this.$missile
	if(missile)
	{
		this.$missile = null
		$missile_inbound.play()
		return
	}

	var entities = player.ship.checkScanner(true)
	if(entities.length >= 32)
		entities = system.allShips
	for(var i = 0; i < entities.length; ++i)
	{
		if(!_isIncomingMissile(entities[i]))
			continue
		//log(this.name, "found incoming missile: " + entities[i])
		$missile_inbound.play()
		return
	}
}
