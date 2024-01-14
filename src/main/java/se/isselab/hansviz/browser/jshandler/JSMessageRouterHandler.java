package se.isselab.hansviz.browser.jshandler;

import se.isselab.hansviz.JSONHandler.JSONHandler;

import com.intellij.codeInsight.navigation.NavigationUtil;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.project.ProjectManager;
import com.intellij.psi.PsiElement;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefQueryCallback;
import org.cef.handler.CefMessageRouterHandlerAdapter;
import se.isselab.HAnS.featureModel.FeatureModelUtil;
import se.isselab.HAnS.featureModel.psi.FeatureModelFeature;

import java.util.List;


public class JSMessageRouterHandler extends CefMessageRouterHandlerAdapter {

    private final Project project = ProjectManager.getInstance().getOpenProjects()[0];
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
            case "highlightPsiElement" -> {
                if(requestTokens.length < 2)
                    return false;
                List<FeatureModelFeature> selectedFeature = FeatureModelUtil.findLPQ(project, requestTokens[1]);
                PsiElement[] test = new PsiElement[selectedFeature.size()];
                int i = 0;
                for(var feature : selectedFeature){
                    test[i] = feature;
                    i++;
                }
                if(selectedFeature.isEmpty())
                    return false;

                NavigationUtil.openFileWithPsiElement(selectedFeature.get(0), false, false);
                callback.success("");
                return true;
            }
        }
        return false;
    }
    // &end[Request]
}
