init() ->
    canvas = document.getElementById("gameCanvas")
    ctx = canvas.getContext("2d")
    window.addEventListener('resize', resizeCanvas, false)
    resizeCanvas()

    ctx.fillStyle = "#FF0000"
    ctx.fillRect(0, 0, 120, 120)


resizeCanvas = () ->
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

$ -> init()

