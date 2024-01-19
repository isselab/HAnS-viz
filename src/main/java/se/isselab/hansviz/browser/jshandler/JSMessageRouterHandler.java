package se.isselab.hansviz.browser.jshandler;

import se.isselab.HAnS.featureExtension.FeatureService;
import se.isselab.hansviz.JSONHandler.JSONHandler;

import com.intellij.openapi.project.Project;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;



public class JSMessageRouterHandler extends CefMessageRouterHandlerAdapter {
    private final Project project;
    public JSMessageRouterHandler(Project project){
        this.project = project;
    }

    //private final FeatureService service = ProjectManager.getInstance().getOpenProjects()[0].getService(FeatureService.class);

    // &begin[Request]

    /**
     * Request on javascript side (that are called with window.java or window.javacancel are handeled here
     * @param browser CefBrowser
     * @param frame CefFrame
     * @param queryId long
     * @param request String: This request will be handled
     * @param persistent boolean
     * @param callback CefQueryCallback: function that is called after success
     * @return boolean
     */
    @Override
    public boolean onQuery(CefBrowser browser, CefFrame frame, long queryId, String request, boolean persistent, CefQueryCallback callback) {
        System.out.println("Request: " + request); // For testing purposes
        String[] requestTokens = request.split(",");
        switch (requestTokens[0]) {
            // Add all queries that need to be handled
            case "buttonClicked" -> {
                System.out.println("Button Clicked!");
                return true;
            }
            case "refresh" -> {
                System.out.println("Refreshing!");
                // return JSON through parameter of success function
                callback.success("JSON");
                return true;
            }
            case "tangling" -> {

                // creates new JSONHandler for Tangling Graph
                new JSONHandler(project, JSONHandler.JSONType.Tangling, callback);
                return true;
            }
            case "tree" -> {
                new JSONHandler(project, JSONHandler.JSONType.Tree, callback);
                return true;
            }
            case "highlightFeature" -> {
                if(requestTokens.length < 2)
                    return false;

                FeatureService featureService = project.getService(FeatureService.class);
                if(featureService == null)
                    return false;

                featureService.highlightFeatureInFeatureModel(requestTokens[1]);
                callback.success("");

                return true;
            }
            case "openPath" -> {
                if(requestTokens.length < 2)
                    return false;
                FeatureService featureService = project.getService(FeatureService.class);
                if(featureService == null)
                    return false;
                if(requestTokens.length>=4){
                    featureService.openFileInProject(requestTokens[1], Integer.parseInt(requestTokens[2]), Integer.parseInt(requestTokens[3]));
                }
                else featureService.openFileInProject(requestTokens[1]);
                callback.success("");
                return true;
            }
        }
        return false;
    }
    // &end[Request]
}
