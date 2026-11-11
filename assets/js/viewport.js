const frame = document.getElementById("game"),
                stage = document.getElementById("stage");
            
            function fit() {
                const k = Math.min(innerWidth / 420, innerHeight / 840);
                stage.style.transform = "scale(" + k + ")";
                stage.style.left = (innerWidth - 420 * k) / 2 + "px";
                stage.style.top = (innerHeight - 840 * k) / 2 + "px";
            }
            addEventListener("resize", fit);
            document.addEventListener("fullscreenchange", fit);
            addEventListener("message", (e) => {
                if (e.source !== frame.contentWindow || e.data?.type !== "giermek-fullscreen") return;
                if (document.fullscreenElement) document.exitFullscreen?.();
                else document.documentElement.requestFullscreen?.();
            });
            fit();
