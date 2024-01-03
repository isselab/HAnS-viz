import com.intellij.openapi.project.DumbService;

public class HanSDumbModeListener implements DumbService.DumbModeListener {
    @Override
    public void exitDumbMode() {
        System.out.println("exitDumbMode");
        System.out.println("Änderung");
        // DumbService.DumbModeListener.super.exitDumbMode();
    }
}
